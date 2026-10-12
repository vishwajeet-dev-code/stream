import { Router } from "express";
import { refreshAccessToken, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import {upload} from '../middleware/multer.middleware.js'
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    userRegister
)

router.route("/login").post(userLogin)

// SECURE ROUTES
router.route("/logout").post(verifyJWT, userLogout)
router.route("/refresh-token").post(refreshAccessToken)
export default router