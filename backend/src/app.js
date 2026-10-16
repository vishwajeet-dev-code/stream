import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import { ApiError } from './utils/ApiError.js'
const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)


app.use(cors({
    origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.includes(origin))
    },
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'



// declare routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/video", videoRouter)

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            const message =
                error.field === "videoFile"
                    ? "Please upload a valid video file in the videoFile field."
                    : "Please upload a valid image for the thumbnail.";

            return res.status(400).json({
                success: false,
                message,
            });
        }

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "File size exceeds the allowed limit.",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid file upload.",
        });
    }

    let statusCode = error instanceof ApiError ? error.statusCode : 500;
    let message =
        error instanceof ApiError
            ? error.message
            : "Internal server error";

    if (error?.code === 11000) {
        statusCode = 409;
        message = "A record with that value already exists.";
    } else if (error?.name === "ValidationError" || error?.name === "CastError") {
        statusCode = 400;
        message = "The request contains invalid data.";
    } else if (Number.isInteger(error?.status) && error.status >= 400 && error.status < 500) {
        statusCode = error.status;
        message = error.message || "Invalid request.";
    }

    if (statusCode >= 500) {
        console.error(error);
        message = "Internal server error";
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
})


export default app