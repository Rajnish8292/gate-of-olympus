const mongoose = require("mongoose")


const transactionSchema = new mongoose.Schema({
    userId : String,
    betAmount : String,
    status : String, // pending OR completed,
    createdAt: String,
    roundId: String,
    transactionId : String
})


module.exports = mongoose.model("transaction", transactionSchema)