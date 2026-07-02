const BetEngine = require("../engine/BetEngine")

const { gameConfig } = require("../constant/game")
const gameEngine = require("./gameEngine")
const databaseManager = require("./dbManager")

const betEngine = new BetEngine(gameConfig, gameEngine, databaseManager)


module.exports = betEngine


