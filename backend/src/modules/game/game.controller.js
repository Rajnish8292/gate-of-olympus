
const {
    generateBoard,
    spinReel,
    evaluateWin
} = require("../../lib/game")


const {
    updateUserNonce,
    validateSpin,
    createUserTransaction,
    generateRoundId,
    generateTransactionId,
    clearTransaction
} = require("../../lib/game")


const {
    betBodySchema
} = require("./game.schema")


const betEngine = require("../../config/betEngine")
const gameEngine = require("../../config/gameEngine")
const databaseManager = require("../../config/dbManager")

const spin = async (req, res) => {

    const {data, success, error} = betBodySchema.safeParse(req.body)

    // check if any value from userId, betAmount, currency are missing 
    if(!success) return res.status(400).json({message : "Incorrect Data. at this", error})

    const { betAmount, currency, userId } = data


    // check if user's sent userId match with token extracted userId or not 
    if(userId != req.userId) return res.status(401).send({message : "userId mismatch from token."})

    try {

        const {
            clientSeed, serverSeed, nonce
        } = req.userData


        const response = await betEngine.startBet({userId, betAmount, currency, clientSeed, serverSeed, nonce})
        await updateUserNonce(userId, nonce);
        res.status(response.status || 200).json(response)


    } catch(err) {
        res.status(500).json({message : "Internal server error.", error: err})

    }

}


const newBoard = (req, res) => {
    const board = gameEngine.generateBoardWithoutWild()
    res.status(200).json({
        board
    })
}


const getProfile = async (req, res) => {
    const userId = req.userId

    try {
        const doc = await databaseManager.getProfile({userId});
        if (!doc) return res.status(404).json({message: "profile not found", data: null})

        const profile = (typeof doc.toObject === 'function') ? doc.toObject() : doc
        const { password, ...safeProfile } = profile
        res.status(200).json({message: "profile found", data: safeProfile})
    } catch (err) {
        res.status(500).json({message: "internal server error.", error: err})
    }

}



module.exports = {
    spin,
    newBoard,
    getProfile
}