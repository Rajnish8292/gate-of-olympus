
const {
    verifyToken
} = require("../utils/jwt")

const authenctationMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;

    if(!header) return res.status(401).json({message : "Invalid token."})

    const token = header.split(" ")[1]

    if(!token) return res.status(401).json({message : "Invalid token."})
    
    try {
        const decoded = verifyToken(token)

        if(!decoded.userId) return res.status(400).json({message : "Invalid token."})

        req.userId = decoded.userId
        next()

    } catch (err) {
        return res.status(400).json({message : "Invalid token."})
    }

}   


module.exports = {
    authenctationMiddleware
}