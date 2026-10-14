
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

const userRegister = asyncHandler(async (req, res) => {
  // GET USER DATA FROM REQUEST
  const { username, email, fullName, password } = req.body;

  // PERFORM VALIDATION ON RECEIVED DATA
  if (
    [username, email, fullName, password].some(
      (field) => typeof field !== "string" || !field.trim()
    )
  ) {
    throw new ApiError(400, "Some fields are missing");
  }

  // CHECK IF USER ALREADY EXISTS
  const userExisted = await User.findOne({
    $or: [
      { username: username.trim().toLowerCase() },
      { email: email.trim().toLowerCase() },
    ],
  });

  if (userExisted) {
    throw new ApiError(409, "Username or email already exists");
  }

  // GET FILE PATHS
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


  // UPLOAD AVATAR
  let avatarImage = null
  if(avatarLocalPath){
    const avatarImageUpload = await uploadOnCloudinary(avatarLocalPath);

    
    if (!avatarImageUpload?.url) {
      throw new ApiError(500, "Failed to upload avatar image");
    }

    avatarImage = avatarImageUpload.url;
  }
  


  // COVER IMAGE IS OPTIONAL
  let coverImage = null;

  if (coverImageLocalPath) {
    const coverImageUpload = await uploadOnCloudinary(
      coverImageLocalPath
    );

    if (!coverImageUpload?.url) {
      throw new ApiError(500, "Failed to upload cover image");
    }

    coverImage = coverImageUpload.url;
  }

  // CREATE USER
  const user = await User.create({
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    password,
    avatar: avatarImage,
    coverImage,
  });

  // EXCLUDE SENSITIVE FIELDS
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering user"
    );
  }

  // RETURN RESPONSE
  return res.status(201).json(
    new ApiResponse(201, "User created successfully", createdUser)
  );
});

const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

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
  await User.updateOne(
    { _id: req.user._id },
    { $unset: { refreshToken: 1 } }
  );

  clearAuthCookies(res);
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out", {}));
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

export {
  getCurrentUser,
  refreshAccessToken,
  userLogin,
  userLogout,
  userRegister,
};
