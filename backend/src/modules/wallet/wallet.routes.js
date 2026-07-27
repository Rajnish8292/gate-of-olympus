
const express = require("express")
const walletRoutes = express.Router()



const {
    authenctationMiddleware
} = require("../../middleware/auth")


const {
    sessionMiddleware
} = require("../../middleware/session")

const {
    getBalance,
    deposit,
    withdrawal,
    getHistory,
    getTransactions
} = require("../wallet/wallet.controller")

walletRoutes.use(authenctationMiddleware)
walletRoutes.use(sessionMiddleware)



walletRoutes.get("/balance", getBalance)
walletRoutes.post("/deposit", deposit)
walletRoutes.post("/withdrawal", withdrawal)
walletRoutes.get("/history", getHistory)
walletRoutes.get("/transaction", getTransactions)


module.exports = walletRoutes