require("dotenv").config();


const app = require("./src/app")
const connectDB = require("./src/config/db")
const {connectRedis} = require("./src/config/redis")

const PORT = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB()
        await connectRedis()

        app.listen(PORT, () => {
            console.log("App is running on port", PORT)
        })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

start()



