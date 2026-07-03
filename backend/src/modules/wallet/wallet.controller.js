const databaseManager = require("../../config/dbManager")


async function getBalance(req, res) {
    try {
        const balance = await databaseManager.getBalance({userId : req.userId});
        res.status(200).json({message: "balance fetched.", balance})
    } catch (err) {
        res.status(500).json({message: "error while fetching balance."})

    }
}


async function deposit(req, res) {
    const {amount } = req.body;

    try {
        const currentBlance = await databaseManager.getBalance({userId : req.userId});

        await databaseManager.updateBalance({
            userId : req.userId,
            balance: (Number(currentBlance) + Number(amount)).toFixed(2)
        })

        res.status(200).json({message: "amount deposit successfull", oldBalance : currentBlance.toFixed(2), newBalance:(Number(currentBlance) + Number(amount)).toFixed(2) })
    } catch (err) {

    }
}


async function withdrawal(req, res) {
    const {amount } = req.body;

    try {
        const currentBalance = await databaseManager.getBalance({userId : req.userId});

        if(Number(amount) > Number(currentBalance)) {
            return res.status(500).json({message: "Not enough balance for withdrawal."})
        }

        await databaseManager.updateBalance({
            userId : req.userId,
            balance: (Number(currentBalance) - Number(amount)).toFixed(2)
        })

        res.status(200).json({message: "amount withdrawal successfull", oldBalance : currentBalance.toFixed(2), newBalance:(Number(currentBalance) - Number(amount)).toFixed(2) })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({message: "error while amount withdrawal."})
    }
}


async function getHistory(req, res) {
    try {
        const histories = await databaseManager.getUserHistory({userId: req.userId})

        res.status(200).json({message: "history fetched successfully.", histories : histories.slice(0, 100)})

    } catch (err) {
        res.status(200).json({message: "error while fetching histories."})

    }
}


async function getTransactions(req, res) {
    try {
        const transactions = await databaseManager.getuserTransaction({userId: req.userId})

        res.status(200).json({message: "transactions fetched successfully.", transactions : transactions.slice(0, 100)})

    } catch (err) {
        res.status(200).json({message: "error while fetching transactions."})

    }
}



module.exports = {
    getBalance,
    deposit,
    withdrawal,
    getHistory,
    getTransactions
}