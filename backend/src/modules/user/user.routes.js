const express = require("express")
const userRoutes = express.Router();


const {
    signIn,
    login
} = require("./user.controller")



userRoutes.post("/register", signIn)
userRoutes.post("/login", login)
// userRoutes.post("/createGameSession", createGameSession)



module.exports = userRoutes




