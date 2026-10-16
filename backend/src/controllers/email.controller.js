import crypto from "crypto"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";



export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query

    if(typeof token !== "string" || !token.trim()){
        throw new ApiError(400, "Verification token is required")
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry:  { $gt: new Date() },
    })

    if(!user){
        throw new ApiError(400, "Invalid or expired verification link")
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, "Email Verified Successfull"))
})