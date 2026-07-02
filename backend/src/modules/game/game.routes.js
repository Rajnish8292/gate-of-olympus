
const express = require("express")
const gameRoutes = express.Router()

const {
    spin,
    newBoard,
    getProfile
    
} = require("./game.controller")


const {
    authenctationMiddleware
} = require("../../middleware/auth")


const {
    sessionMiddleware
} = require("../../middleware/session")



gameRoutes.use(authenctationMiddleware)
gameRoutes.use(sessionMiddleware)




gameRoutes.post("/bet", spin)
gameRoutes.get("/newBoard", newBoard)
gameRoutes.get("/profile", getProfile)



module.exports = gameRoutes