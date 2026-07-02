const mongoose = require("mongoose")



const sessionSchema = new mongoose.Schema({
    clientSeed : String,
    serverSeed : String,
    nonce : Number,
    token : String,
    userId: String
})


module.exports = mongoose.model("session", sessionSchema)