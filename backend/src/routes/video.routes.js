import { Router } from "express";
import { getAllVideos, getVideoById, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.post(
  "/upload-video",
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.get("/", getAllVideos)
router.get("/:videoId", getVideoById)
export default router;
