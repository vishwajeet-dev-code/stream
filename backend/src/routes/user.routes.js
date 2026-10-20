import { Router } from "express";
import {
    forgotPassword,
    getCurrentUser,
    refreshAccessToken,
    resetPassword,
    userLogin,
    userLogout,
    userRegister,
} from "../controllers/user.controller.js";
import {upload} from '../middleware/multer.middleware.js'
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAllowedOrigin } from "../middleware/origin.middleware.js";
import { verifyEmail } from "../controllers/email.controller.js";

const router = Router()

router.use(verifyAllowedOrigin)

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
router.route("/current-user").get(verifyJWT, getCurrentUser)

// SECURE ROUTES
router.route("/logout").post(verifyJWT, userLogout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password").post(resetPassword)

// EMAIL VERIFY
router.get("/verify-email", verifyEmail)
export default router