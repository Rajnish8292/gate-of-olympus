const crypto = require('crypto');  


const generateServerSeed = () => {
    return crypto.randomBytes(72).toString("hex")
}


module.exports = {generateServerSeed}