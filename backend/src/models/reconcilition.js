const mongoose = require("mongoose")



const reconcilitionSchema = new mongoose.Schema({
    userId: String,
    transactionId: String,
    roundId: String,
    reason: String,
    originalBalance : String,
    expectedBalance: String
})


module.exports = mongoose.model("reconcilition", reconcilitionSchema)