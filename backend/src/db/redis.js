import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || "redis:localhost:6379", {
    maxRetriesPerRequest: 1
})

redis.on("connect", () => {
    console.log("Redis connected successfully");
})

redis.on("error", (e) => {
    console.log("Redis Error: ", e)
})

export default redis

