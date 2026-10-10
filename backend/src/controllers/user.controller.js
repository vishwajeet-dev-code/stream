
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    new ApiResponse(201, createdUser, "User created successfully")
  );
});

export { userRegister };
