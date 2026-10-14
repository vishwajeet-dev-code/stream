import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'
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
}
})


export default app