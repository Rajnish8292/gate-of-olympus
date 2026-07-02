
const GameEngine = require("../engine/GameEngine")
const { gameConfig } = require("../constant/game")
const databaseManager = require("./dbManager")
const rngEngine = require("./rngEngine")




const gameEngine = new GameEngine(gameConfig, databaseManager, rngEngine)


// async function result() {
//     let r = await gameEngine.spinReel({
//         userId: "user1",
//         clientSeed: "clientSeed1",
//         serverSeed: "vhiugbihhivbvuir",
//         nonce: 1
//     })

//     console.log(JSON.stringify(r))
// }


// result()
module.exports = gameEngine