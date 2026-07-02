const crypto = require("crypto")
const { gameConfig } = require("../constant/game")

class RngEngine {


    /*
     * generate random symbol for a cell in board.
     * @params {number} randomNum - it value must be between 0-1
     * @return {string} 
    */
    generateRandomSymbol(randomNum) {
        if(randomNum < 0 || randomNum > 1 ) throw new Error("randomNum is out of bound. expexted value must be in [0, 1] range. but got", randomNum);

        let currentProgress = 0;
        let targetProgress = randomNum;

        let targetSymbol = null;



        let symbolsName = Object.keys(gameConfig.symbolName);

        for(let i = 0; i < symbolsName.length; i++) {

            let symbol = symbolsName[i];

            // working :
            // CROWN -> [0, 0.0415] HOURGLASS -> [0.0415, 0.0415 + 0.0553] ....... and more
            currentProgress += gameConfig.symbols[symbol].probability;

            if(currentProgress > targetProgress) {
                targetSymbol = symbol;
                break;
            }
        }


        return targetSymbol

    }


    /*
     *  using clientSeed, serverSeed and nonce it generate a random hex key of length 270.
     *  @params {string} clientSeed
     *  @params {string} serverSeed
     *  @params {number} nonce
     *  @return {hexadecimal string}
    */
    async generateHexKey({clientSeed, serverSeed, nonce}) {
        
        if(!clientSeed || !serverSeed) throw new Error("parameter is missing in generateHexKey.")

        try {

            let result = '';
            let i = 0;
            let length = 8 * (gameConfig.reels * gameConfig.row);

            while (result.length < length) {
                const hmac = await crypto.createHmac('sha256', serverSeed);
                await hmac.update(`${clientSeed}:${nonce}:${i}`);
                result += hmac.digest('hex');
                i++;
            }

            return result.slice(0, length);

        } catch (err) {
            throw new Error("error while creating hex key.")
        }

    }


}


module.exports = RngEngine