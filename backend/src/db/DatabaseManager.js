const connectDB = require("../config/db")
const { connectRedis, redisClient } = require("../config/redis")
const transaction = require("../models/transaction")
const user = require("../models/user")
const history = require("../models/history")

const reconcilition = require("../models/reconcilition")





class DatabaseManager {
    constructor() {
        this.redisClient = redisClient
        this.silent = true
    }

    async connectAllDatabase() {
        await Promise.all([
            connectDB(),
            connectRedis()
        ])
        .then((data) => {
            console.log(data)
        })
    }


log(type, userId, data = {}) {

    if(this.silent) return;

    const timestamp = new Date().toISOString();

    switch (type) {
        case "LOCK_BET":
            console.log(
                `[${timestamp}] LOCK_BET | User: ${userId} | Bet locked`
            );
            break;

        case "UNLOCK_BET":
            console.log(
                `[${timestamp}] UNLOCK_BET | User: ${userId} | Bet unlocked`
            );
            break;

        case "CREATE_TRANSACTION":
            console.log(
                `[${timestamp}] CREATE_TRANSACTION | User: ${userId} | Transaction: ${data.transactionId} | Round: ${data.roundId} | Bet: ${data.betAmount}`
            );
            break;

        case "COMPLETE_TRANSACTION":
            console.log(
                `[${timestamp}] COMPLETE_TRANSACTION | User: ${userId} | Transaction: ${data.transactionId}`
            );
            break;

        case "GET_BALANCE":
            console.log(
                `[${timestamp}] GET_BALANCE | User: ${userId} | Balance: ${data.balance}`
            );
            break;

        case "UPDATE_BALANCE":
            console.log(
                `[${timestamp}] UPDATE_BALANCE | User: ${userId} | New: ${data.balance}`
            );
            break;

        case "SET_WILD_MAP":
            console.log(
                `[${timestamp}] SET_WILD_MAP | User: ${userId}`
            );
            break;

        case "GET_WILD_MAP":
            console.log(
                `[${timestamp}] GET_WILD_MAP | User: ${userId}`
            );
            break;

        case "ERROR":
            console.error(
                `[${timestamp}] ERROR | User: ${userId} | ${data.message}`
            );
            break;

        default:
            console.log(
                `[${timestamp}] UNKNOWN_EVENT | User: ${userId} | Type: ${type}`
            );
    }
}


    async lockBet(userId) {
        this.log("LOCK_BET", userId)
        await redisClient.set(`lock:spin:player:${userId}`, 'LOCKED', { EX : 5 });
    }
    async unlockBet(userId) {
        this.log("UNLOCK_BET", userId)
        await redisClient.del(`lock:spin:player:${userId}`)
    }
    async isBetLocked(userId) {
        const isLock = await redisClient.get(`lock:spin:player:${userId}`);
        return isLock
    }
    async getWildMap(userId) {
        let redisReq = await redisClient.get(`wild:player:${userId}`)
        return (redisReq) ? JSON.parse(redisReq).map : null
    }

    async getFreeSpinStatus(userId) {
        let redisRed = await redisClient.get(`freespin:player:${userId}`);
        return JSON.parse(redisRed);
    }

    async setFreeSpinData({userId, betAmount, freeSpinId, freeSpinCount, freeSpinTotalCount, totalWinAmount, accumulatedMultiplier, freeSpinCompleted}) {
        const data = {
            betAmount,
            freeSpinId,
            freeSpinCount,
            freeSpinTotalCount,
            totalWinAmount,
            accumulatedMultiplier,
            freeSpinCompleted,
            hasFreeSpinCalcuated : true
        }
        await redisClient.set(`freespin:player:${userId}`, JSON.stringify(data));
    }

    async deleteFreeSpinStatus(userId) {
        await redisClient.del(`freespin:player:${userId}`);
    }

    async setWildMap(userId, wildMap) {
        await redisClient.set(`wild:player:${userId}`, JSON.stringify({map : wildMap}))
    }

    async createTransaction({userId, betAmount, roundId, transactionId}) {
        this.log("CREATE_TRANSACTION", userId)
        await transaction.create({
            userId, betAmount,
            status : "pending",
            createdAt : Date.now().toString(),
            roundId,
            transactionId
        })
    }

    async completeTransaction({userId, transactionId}) {
        await transaction.updateOne(
            {userId, transactionId},
            {status : "completed"}
        )
    }

    async failTransaction({userId, transactionId}) {
        await transaction.updateOne(
            {userId, transactionId},
            {status : "failed"}
        )
    }
    async getBalance({userId}) {
        const document = await user.findOne({userId})
        return Number(document.balance)
    }

    async getProfile({userId}) {
        const document = await user.findOne({userId})
        return document
    }

    async getUserHistory({userId}) {
        const histories = await history.find({userId});
        return histories;
    }

    async getuserTransaction({userId}) {
        const transactions = await transaction.find({userId});
        return transactions;
    }

    async updateBalance({userId, balance}) {
        await user.updateOne(
            {userId},
            {balance}
        )
        this.log("UPDATE_BALANCE", userId, {balance})

    }

    async createUserHistory({userId, betAmount, winAmount, roundId, transactionId, currency}) {
        await history.create({
            userId,
            betAmount,
            winAmount,
            roundId,
            transactionId,
            currency,
            createdAt : Date.now().toString()
        })
    }

    async flagForReconciliation({userId, transactionId, roundId, reason,originalBalance, expectedBalance }) {
        await reconcilition.create({
            userId,
            transactionId,
            roundId,
            reason,
            originalBalance,
            expectedBalance
        })
    }

}




module.exports = DatabaseManager