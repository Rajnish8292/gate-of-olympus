const express = require("express")
const cors = require("cors");

const app = express()
const routes = require("./routes")
app.use(cors({
    origin: "*", // For development only
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json())
app.use("/api", routes)

module.exports = app