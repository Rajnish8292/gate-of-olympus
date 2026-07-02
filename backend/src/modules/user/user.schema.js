const {z} = require("zod")

const userSchema = z.object({
    email : z.string(),
    password : z.string(),
    userId : z.string()
})


const sessionSchema = z.object({
    userId: z.string(),
    password: z.string(),
    clientSeed : z.string()
})



module.exports = {
    userSchema,
    sessionSchema
}