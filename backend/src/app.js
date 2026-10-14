import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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



// declare routes
app.use("/api/v1/users", userRouter)

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    const statusCode = Number.isInteger(error.statusCode)
        ? error.statusCode
        : 500
    const message = statusCode < 500
        ? error.message
        : "Internal Server Error"

    return res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors ?? [],
    })
})


export default app