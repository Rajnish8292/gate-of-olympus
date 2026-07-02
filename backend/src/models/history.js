const mongoose = require("mongoose")



const historySchema = new mongoose.Schema({
    userId: String,
    betAmount: String,
    winAmount: String,
    roundId: String,
    transactionId: String,
    currency: String,
    createdAt: String
})


module.exports = mongoose.model("history", historySchema)