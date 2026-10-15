
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { execFile } from "node:child_process";
import { promisify } from "node:util";


const execFileAsync = promisify(execFile);

export const getVideoDuration = async (filePath) => {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);

  const duration = Number(stdout.trim());

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Unable to determine video duration");
  }

  return Math.floor(duration);
};


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

  // 4. get the video duration
  let duration;

  try {
    duration = await getVideoDuration(videoFilePath);
  } catch {
  throw new ApiError(400, "Invalid video file or unable to read duration");
  }

  // 5. Upload video to Cloudinary
  const uploadedVideo = await uploadOnCloudinary(videoFilePath);

  if (!uploadedVideo?.url) {
    throw new ApiError(500, "Failed to upload video");
  }

  // 6. Upload thumbnail to Cloudinary
  const uploadedThumbnail = await uploadOnCloudinary(
    thumbnailFilePath
  );

  if (!uploadedThumbnail?.url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }
  

  // 7. Create video document
  const video = await Video.create({
    title: title.trim(),
    description: description?.trim() || "",
    owner,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    duration
  });

  // 8. Return response
  return res.status(201).json(
    new ApiResponse(
      201,
      video,
      "Video uploaded successfully"
    )
  );
});

export { uploadVideo };
