import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const corsOrigins = process.env.CORS_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: corsOrigins?.length ? corsOrigins : undefined,
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




export default app