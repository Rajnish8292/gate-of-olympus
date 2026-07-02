



const session = require("../models/session")


// this middleware extract session data from database and pass it to next route
const sessionMiddleware = async (req, res, next) => {
    const userId = req.userId;

    try {
        const sessionData = await session.findOne({userId})

        if(!sessionData) return res.status(400).json({message : "Session not found."});


        const {
            clientSeed,
            serverSeed,
            nonce
        } = sessionData;

        req.userData = {
            clientSeed,
            serverSeed,
            nonce
        }
        
        next()
    } catch (err) {
        res.status(500).json({
            message : "something went wrong."
        })
    }
}


module.exports = {
    sessionMiddleware
}