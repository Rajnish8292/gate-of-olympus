const crypto = require("crypto")



const { gameConfig } = require("../constant/game")

const session = require("../models/session")
const { success, symbol } = require("zod")

const {redisClient} = require("../config/redis")
const transaction = require("../models/transaction")


const updateUserNonce = async (userId, nonce) => {

    const updatedNonce = nonce + 1;

    const updatedSession = await session.updateOne(
        {userId},
        {nonce : updatedNonce}
    );

    return updatedNonce
}


const generateRoundId = () => {
    return crypto.randomBytes(18).toString("hex")
}


const generateTransactionId = () => {
    return crypto.randomBytes(18).toString("hex")
}


module.exports = {

  updateUserNonce,
  generateRoundId,
  generateTransactionId,

}