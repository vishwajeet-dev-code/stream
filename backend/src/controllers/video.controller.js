
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // 1. Get data
  const { title, description } = req.body;
  const owner = req.user?._id;

  // 2. Validate data
  if (!owner) {
    throw new ApiError(401, "User is not authenticated");
  }

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  // 3. Get uploaded file paths
  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailFilePath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // 4. Upload video to Cloudinary
  const uploadedVideo = await uploadOnCloudinary(videoFilePath);

  if (!uploadedVideo?.url) {
    throw new ApiError(500, "Failed to upload video");
  }

  // 5. Upload thumbnail to Cloudinary
  const uploadedThumbnail = await uploadOnCloudinary(
    thumbnailFilePath
  );

  if (!uploadedThumbnail?.url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  // 6. Create video document
  const video = await Video.create({
    title: title.trim(),
    description: description?.trim() || "",
    owner,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
  });

  // 7. Return response
  return res.status(201).json(
    new ApiResponse(
      201,
      video,
      "Video uploaded successfully"
    )
  );
});

export { uploadVideo };
