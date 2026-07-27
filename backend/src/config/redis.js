
const {createClient} = require("redis")



const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on("error", (err) => {
    console.log("Redis error", err);
})


const connectRedis = async () => {
    try {
        await redisClient.connect()
        // await redisClient.flushDb()
        console.log("Redis client is connected.")
    } catch(err) {
        console.log("Redis client is not connected.", err.message)
    }
}

module.exports =  {redisClient, connectRedis};