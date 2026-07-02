const express = require("express")

const routes = express.Router();

routes.use("/user", require("../modules/user/user.routes"))
routes.use("/game", require("../modules/game/game.routes"))


module.exports = routes


