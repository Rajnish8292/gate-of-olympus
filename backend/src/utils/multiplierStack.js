

const { gameConfig } = require('../constant/game');
const  rngEngine  = require('../config/rngEngine');



/*
 * generate random multiplier payout for a multiplier symbol.
 * @params {string} clientSeed
 * @params {string} serverSeed
 * @params {number} nonce
 * @params {number} tumbleIndex
 * @return {string} 
*/

const getRandomMultiplierPayout = async ({
    clientSeed, serverSeed, nonce, tumbleIndex
}) => {


    const hexKey = await rngEngine.generateHexKey({ clientSeed, serverSeed, nonce: `${nonce}-${tumbleIndex}-multiplier` });
    const randomNum = parseInt(hexKey.slice(0, 8), 16) / Math.pow(16, 8);

    if(randomNum < 0 || randomNum > 1 ) throw new Error("randomNum is out of bound. expexted value must be in [0, 1] range. but got", randomNum);

    let currentProgress = 0;
    let targetProgress = randomNum;

    let targetMultiplier = null;

    let symbolsName = Object.keys(gameConfig.MULTIPLIER_PAYOUT);


    
    for(let i = 0; i < symbolsName.length; i++) {

        let symbol = symbolsName[i];

        // working :
        // 1X -> [0, 0.0415] 2X -> [0.0415, 0.0415 + 0.0553] ....... and more
        currentProgress += gameConfig.MULTIPLIER_PAYOUT[symbol].probability;

        if(currentProgress > targetProgress) {
            targetMultiplier = gameConfig.MULTIPLIER_PAYOUT[symbol].payout;
            break;
        }
    }


    return targetMultiplier

    
}



/*
 * handle multiplier payout stack for each tumble
 * @params {Array} board -> array of symbol names of size 30.
 * @params {Array} multiplierPayoutStack -> array of multiplier payout stack for each tumble
 * @params {string} clientSeed
 * @params {string} serverSeed
 * @params {number} nonce
 * @params {number} tumbleIndex
 * @return {void}
 * 
 * @Explanation ->
 * multiplierPayoutStack is an array of stacks (or you can say array) for each reel in the slot.
 * we use this stack to store the multiplier payout for each multiplier symbol in the reel
 * eg :
 *   first column of the board => [MULTIPLIER, HOURGLASS, MULTIPLIER, YELLOWGEM, HOURGLASS]
 *   multiplierPayoutStack => [[2X, 3X], [according to the second column], [according to the third column], [according to the fourth column], [according to the fifth column], [according to the sixth column]]
 *   
 *   MULTIPLIER (i = 2) = 2X
 *   MULTIPLIER (i = 0) = 3X
 * 
 *  stack use FILO (First In Last Out) principle. which resembles with our cascading logic for the game.
 *  top of the stack is the first multiplier payout for the first multiplier symbol from top in the reel. and so on.
 * 
*/

const handleMultiplierPayoutStack = async ({board, multiplierPayoutStack, clientSeed, serverSeed, nonce, tumbleIndex}) => {
    for(let i = 0; i < multiplierPayoutStack.length; i++) {

        const stack = multiplierPayoutStack[i];
        const row = gameConfig.row;
        const multiplier_count_board = board.slice(i * row, (i + 1) * row).join('').split(gameConfig.symbolName.MULTIPLIER).length - 1;
        const multiplier_count_stack = stack.length;

        if(multiplier_count_board > multiplier_count_stack) {
            const random_multiplier_payout = await getRandomMultiplierPayout({ clientSeed, serverSeed, nonce, tumbleIndex });
            stack.unshift(random_multiplier_payout);
        }

    }
}


module.exports = { handleMultiplierPayoutStack }
