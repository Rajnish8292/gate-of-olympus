
const gameEngine = require("../config/gameEngine")
const databaseManager = require("../config/dbManager")
const {generateRoundId, generateTransactionId} = require("../lib/game")
const { isValid } = require("zod/v3")

class BetEngine {
    constructor(gameConfig, gameEngine, databaseManager) {
        this.gameConfig = gameConfig
        this.databaseManager = databaseManager
        this.gameEngine = gameEngine
    }

    async validateBet({userId, betAmount, currency}) {
        if(betAmount < this.gameConfig.minBetAmount) return {success : false, message : `bet amount is less than ${this.gameConfig.minBetAmount}`};
        if(betAmount > this.gameConfig.maxBetAmount) return {success : false, message : `bet amount is more than ${this.gameConfig.maxBetAmount}`};

        // NOTE : 
        // check from redis database if spin is locked or not

        const isLock = await this.databaseManager.isBetLocked(userId)

        if(isLock) return {success: false, message : `bet is locked for ${userId}, wait for sometime to unlock it automatically.`}

        return {
        success : true,
        message : null
        }
    }


    /*
     * evaluate the total win multiplier and winning symbols based on the winSymbol array
     * @params {Array} winSymbol -> array of winning symbols with their counts [{name: string, count: number}]
     * @return {Object} -> return an object with totalWinMultiplier and winningSymbols
     */ 
    evaluateTotalWinWithoutMultiplierPayout(winSymbol) {


        const result = {
            totalWinMultiplier : 0,
            winningSymbols : []
        }

        const inRange = (symbolCount, min, max) => {
            return symbolCount >= min && symbolCount <= max;
        }

        
        for(let i = 0; i < winSymbol.length; i++) {

            const {name : symbolName, count : symbolCount}  = winSymbol[i];

            if(!this.gameConfig.symbolName.hasOwnProperty(symbolName)) throw new Error(`Invalid symbol name ${symbolName} in winSymbol array`);

            const symbolConfig = this.gameConfig.symbols[symbolName];
            const payoutConfig = symbolConfig.payout;

            Object.keys(payoutConfig).forEach((key) => {
                const [min, max] = key.split("_").map(Number);

                if(inRange(symbolCount, min, max)) {
                    result.totalWinMultiplier += payoutConfig[key];
                    result.winningSymbols.push({
                        symbol : {symbolName, symbolCount},
                        winMultiplier : payoutConfig[key]
                    });
                }

            })
            

        }

        return result;
    }

    /*
     * organize the response of the spin result to be sent to the client
     * @params {Array} boardState -> array of board states with their winning symbols and counts [{board: string[], matchSymbol: {name: string, count: number}[]}]
     * @params {number} tumbles -> number of tumbles
     * @return {Object} -> return an object with the following structure
        {
            board : string[],
            tumble: number,
            totalWinMultiplier: number,
            winningSymbols: [{symbol : {name: string, count: number}, winMultiplier: number}]
        }[]
    */
    organizeRespone({boardState, tumbles, multiplierPayoutStack}) {
        const response = {
            totalWinMultiplier: 0,
            state : [],
            tumbles : tumbles + 1, // add 1 to include the initial spin
            multiplierPayoutStack : multiplierPayoutStack,
            totalMultiplierPayout : multiplierPayoutStack.flat().reduce((acc, curr) => acc + curr, 0)
        }

        for(let i = 0; i < boardState.length; i++) {
            const {board, matchSymbol} = boardState[i];
            const payout = this.evaluateTotalWinWithoutMultiplierPayout(matchSymbol);


            response.state.push({
                board,
                tumble: i,
                totalWinMultiplier: payout.totalWinMultiplier,
                winningSymbols: payout.winningSymbols
            })
            response.totalWinMultiplier += payout.totalWinMultiplier;
        }

        // multiply the total win multiplier with the total multiplier payout to get the final total win multiplier
        response.totalWinMultiplier *= response.totalMultiplierPayout;


        return response;


    }

    

    async startBet({ userId, betAmount, currency, clientSeed, serverSeed, nonce }) {
        
        const roundId = generateRoundId();
        const transactionId = generateTransactionId();
        const betAmountNum = Number(betAmount);

        const [currentUserBalance] = await Promise.all([
            this.databaseManager.getBalance({ userId }),
            this.databaseManager.lockBet(userId),
        ]);


        try {

            await Promise.all([
                this.databaseManager.createTransaction({ userId, betAmount, roundId, transactionId }),
                this.databaseManager.updateBalance({ userId, balance: (currentUserBalance - betAmountNum).toFixed(2) }),
            ]);



            const { boardState, tumbles, multiplierPayoutStack } = await this.gameEngine.spinReel({ userId, clientSeed, serverSeed, nonce });

            
            const payout = this.organizeRespone({ boardState, tumbles, multiplierPayoutStack });
            const winAmount = payout.totalWinMultiplier * betAmountNum;
            const newBalance = parseFloat((currentUserBalance - betAmountNum + winAmount).toFixed(2));



            await Promise.all([
                this.databaseManager.updateBalance({ userId, balance: newBalance }),
                this.databaseManager.completeTransaction({ userId, transactionId }),
                this.databaseManager.createUserHistory({ userId, betAmount, winAmount, roundId, transactionId, currency }),
            ]);

            return {
                message: "bet completed.",
                betAmount,
                ...payout,
                winAmount,
                newBalance,
                roundId,
                transactionId
            };
        } finally {
            await this.databaseManager.unlockBet(userId);
        }
    }
}


module.exports = BetEngine