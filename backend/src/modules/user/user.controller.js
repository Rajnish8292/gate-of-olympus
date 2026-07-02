

const { userSchema, sessionSchema } = require("./user.schema")
const {
     createUser,
     loginUser,
     findUser
} = require("./user.services")

const crypto = require("crypto")




const signIn = async (req, res) => {

    const {data, success, error} = userSchema.safeParse(req.body)

    if(!success) return res.status(400).json(error)
    
    const newUser = await createUser(data)

    res.status(200).json(newUser)

}


const login = async (req, res) => {
    const {data, success, error} = sessionSchema.safeParse(req.body);
    if(!success) return res.status(400).json(error)

    const userExist = await findUser({userId: data.userId})
    if(!userExist) return res.status(400).json({message : "user does not exist!"})
    
    const hashedPassword = await crypto.hash("sha256", data.password);
    if(userExist.password !== hashedPassword) return res.status(401).json({message : "password incorrect!"})

    const loggingUser = await loginUser(data);
    return res.status(200).json(loggingUser)


}

module.exports = {
    signIn,
    login
}