import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import crypto from "node:crypto";
import redis from "../db/redis.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";

const getCookieOptions = (token) => {
  const decodedToken = jwt.decode(token);
  if (!decodedToken || typeof decodedToken === "string" || !decodedToken.exp) {
    throw new ApiError(500, "Unable to create authentication cookies");
  }

  const sameSite = getCookieSameSite();
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true" ||
    sameSite === "none";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: Math.max(decodedToken.exp * 1000 - Date.now(), 0),
  };
};

const clearAuthCookies = (res) => {
  const sameSite = getCookieSameSite();
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true" ||
    sameSite === "none";
  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

function getCookieSameSite() {
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  if (!["lax", "strict", "none"].includes(sameSite)) {
    throw new ApiError(500, "COOKIE_SAME_SITE must be lax, strict, or none");
  }
  return sameSite;
}

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, getCookieOptions(accessToken));
  res.cookie("refreshToken", refreshToken, getCookieOptions(refreshToken));
};

const generateAccessAndRefreshToken = async (user) => {
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
  };
};

const deliverVerificationEmail = async (email, token) => {
  try {
    await sendVerificationEmail(email, token);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new ApiError(
      503,
      "The account was saved, but the verification email could not be sent. Retry registration with the same username, email, and password."
    );
  }
};

const userRegister = asyncHandler(async (req, res) => {
  // GET USER DATA FROM REQUEST
  const { username, email, fullName, password } = req.body || {};

  // PERFORM VALIDATION ON RECEIVED DATA
  if (
    [username, email, fullName, password].some(
      (field) => typeof field !== "string" || !field.trim()
    )
  ) {
    throw new ApiError(400, "Some fields are missing");
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  // CHECK IF USER ALREADY EXISTS
  const userExisted = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });

  if (userExisted) {
    const canResendVerification =
      !userExisted.isEmailVerified &&
      userExisted.username === normalizedUsername &&
      userExisted.email === normalizedEmail &&
      (await userExisted.isPasswordCorrect(password));

    if (canResendVerification) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      userExisted.emailVerificationToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      userExisted.emailVerificationExpiry = Date.now() + 15 * 60 * 1000;
      await userExisted.save({ validateBeforeSave: false });
      await deliverVerificationEmail(normalizedEmail, rawToken);

      return res.status(200).json(
        new ApiResponse(200, "Verification email sent", {
          email: normalizedEmail,
        })
      );
    }

    throw new ApiError(409, "Username or email already exists");
  }

  // GET FILE PATHS
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // UPLOAD AVATAR
  let avatarImage = null;
  if (avatarLocalPath) {
    const avatarImageUpload = await uploadOnCloudinary(avatarLocalPath);

    if (!avatarImageUpload?.url) {
      throw new ApiError(500, "Failed to upload avatar image");
    }

    avatarImage = avatarImageUpload.url;
  }

  // COVER IMAGE IS OPTIONAL
  let coverImage = null;

  if (coverImageLocalPath) {
    const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImageUpload?.url) {
      throw new ApiError(500, "Failed to upload cover image");
    }

    coverImage = coverImageUpload.url;
  }

  // VERIFY EMAIL
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // CREATE USER
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    fullName: fullName.trim(),
    password,
    avatar: avatarImage,
    coverImage,
    isEmailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: Date.now() + 15 * 60 * 1000,
  });

  await deliverVerificationEmail(normalizedEmail, rawToken);

  // EXCLUDE SENSITIVE FIELDS
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // RETURN RESPONSE
  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new ApiError(400, "Username and password are required");
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid username or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  setAuthCookies(res, accessToken, refreshToken);
  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user: loggedInUser,
    })
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user retrieved", req.user));
});

const userLogout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $unset: { refreshToken: 1 } });

  clearAuthCookies(res);
  return res.status(200).json(new ApiResponse(200, "User logged out", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token is missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const user = await User.findById(decodedToken?._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token is invalid or revoked");
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id, refreshToken: incomingRefreshToken },
    { $set: { refreshToken } },
    { new: true }
  );
  if (!updatedUser) {
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token has already been rotated");
  }

  setAuthCookies(res, accessToken, refreshToken);
  return res
    .status(200)
    .json(new ApiResponse(200, "Authentication tokens refreshed", {}));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (typeof email !== "string" || !email.trim()) {
    throw new ApiError(400, "Please enter an email");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(400, "Invalid email or not existed");
  }
  console.log(user);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  if (!(rawToken && hashedToken)) {
    throw new ApiError(
      500,
      "Internal Server Error || Token not generated (line: 320)"
    );
  }
  console.log(rawToken)

  function passwordKey(hashedToken) {
    return `reset-password:${hashedToken}`;
  }

  await redis.set(passwordKey(hashedToken), user._id, "EX", 300); // Valid for 5 minutes

  await sendResetPasswordEmail(normalizedEmail, rawToken); // send email to users mail
  return res
    .status(200)
    .json(new ApiResponse(200, "Verification Email sends Successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (typeof token !== "string" || !token.trim()) {
    throw new ApiError(400, "Token is required");
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (typeof confirmPassword !== "string" || newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  function passwordKey(hashedToken) {
    return `reset-password:${hashedToken}`;
  }

  const userId = await redis.getdel(passwordKey(hashedToken));

  if (!userId) {
    throw new ApiError(400, "Invalid token or expired");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.password = confirmPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully"));
});

export {
  getCurrentUser,
  refreshAccessToken,
  userLogin,
  userLogout,
  userRegister,
  forgotPassword,
  resetPassword
};
