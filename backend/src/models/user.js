const mongoose = require("mongoose")
const { email } = require("zod")

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    userId: String,
    balance : String,
    currency : String
})

module.exports = mongoose.model("user", userSchema)