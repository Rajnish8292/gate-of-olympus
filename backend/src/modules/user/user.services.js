
const user = require("../../models/user")
const session = require("../../models/session")
const crypto = require("crypto")

const {
    generateServerSeed
} = require("../../utils/rng")

const {
    signData
} = require("../../utils/jwt")

const createUser = async ({email, password, userId}) => {

    const hashedPassword = await crypto.hash("sha256", password)
    const newUser = await user.create({
        email, 
        password : hashedPassword, 
        userId,
        balance : "0.00",
        currency : "INR"
    })

    return newUser
}

const findSession = async ({userId}) => {
    const sessionExist = await session.findOne({userId})
    return sessionExist
}

const findUser = async ({userId}) => {
    const userExist = await user.findOne({userId})
    return userExist
}



const loginUser = async ({userId, password, clientSeed}) => {
    const sessionExist = await findSession({userId})

    if(!sessionExist) {
        const serverSeed = generateServerSeed();
        const nonce = 0
        const token =  await signData({userId})

        const sessionInfo = await session.create({
            clientSeed,
            serverSeed,
            nonce,
            token,
            userId
        })

        return {userId, token}
    } 

    const token = await signData({userId});
    const updatedSession = await session.updateOne(
        {userId},
        {token, clientSeed}
    )


    return {userId, token, clientSeed}
}


module.exports = {
    createUser,
    loginUser,
    findUser
}