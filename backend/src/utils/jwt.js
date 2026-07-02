
const jwt = require("jsonwebtoken")

const signData = async ({userId}) => {
    const token = await jwt.sign({
        userId
    },
    process.env.JWT_SECRET_KEY,
    {
        expiresIn: "7d"
    })

    return token
}



const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY)
}


module.exports = {
    signData, verifyToken
}
