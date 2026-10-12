
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (user) =>{
  try {
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {
      accessToken, refreshToken
    }
  } catch (error) {
    throw new ApiError(500,"Internal Server Error")
    
  }
  
}

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

const userLogin = asyncHandler( async (req, res) => {

  // get data from frontend
  const {username, password} = req.body
  
  // validate data
  if(!username?.trim() || !password){
    throw new ApiError(400, "username and password required")
  }

  // check if user already register
  const user = await User.findOne({username})
  if(!user){
    throw new ApiError(404, "User does not exits")
  }

  // match the password
  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401, "Password is incorrect")
  }

  // generate access and refresh token
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user)

  // send cookie
  const loogedUser = await User.findById(user._id).select("-password -refreshToken")
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
      user: loogedUser,
      accessToken, refreshToken
      },
      "User login Successfully"
    )
  )

})

const userLogout = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        refreshToken: undefined
      }
      

    },{new: true}
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, "User logged out", {}))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
  if(!incommingRefreshToken){
    throw new ApiError(401, "unauthorized Request")
  }

  const decodedtoken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decodedtoken?._id)
  if(!user){
    throw new ApiError(401, "Invalid Refresh Token")
  }

  if(incommingRefreshToken !== user?.refreshToken){
    throw new ApiError(401, "Invalid Token")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user)

  const options = {
    httpOnly: true,
    secure: true
  }
  console.log(`incomming token: ${incommingRefreshToken} \n New Token: ${accessToken}`)

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, "Token refreshed", {}))
}) 

export { userRegister, userLogin, userLogout, refreshAccessToken };
