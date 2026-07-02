
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


    async handleFreeSpinUpdate(userId, betAmount, freeSpinStatus, totalMultiplierPayout, winAmount,shouldStartBaseFreeSpin, shouldAdditionalFreeSpin) {
            // handle update for free spin data if it started
            let finalData = null;
            if(freeSpinStatus?.hasFreeSpinStarted) {
                
                const updatedfreeSpinData = {
                    ...freeSpinStatus,
                    freeSpinTotalCount : Number(freeSpinStatus.freeSpinTotalCount) + ((shouldAdditionalFreeSpin) ? this.gameConfig.freespin.additiona.spin : 0),
                    freeSpinCount : Number(freeSpinStatus.freeSpinCount) + 1,
                    totalWinAmount : Number(freeSpinStatus.freeSpinCount) + winAmount,
                    accumulatedMultiplier: Number(freeSpinStatus.accumulatedMultiplier) + totalMultiplierPayout,
                    freeSpinCompleted : Number(freeSpinStatus.freeSpinCount + 1) >= Number(freeSpinStatus.freeSpinTotalCount),

                }

                finalData = updatedfreeSpinData

                // if free
                if(updatedfreeSpinData.freeSpinCount >= freeSpinStatus.freeSpinTotalCount) {
                    await this.databaseManager.deleteFreeSpinStatus(userId)
                } else {
                    await this.databaseManager.setFreeSpinData(updatedfreeSpinData)
                }
            } else {

                // if free spin is not already started and we get a base free spin then start the free spin
                if(shouldStartBaseFreeSpin) {
                    const freeSpinData = {
                        userId,
                        betAmount,
                        freeSpinCount : 0,
                        freeSpinTotalCount : this.gameConfig.freespin.base.spin,
                        totalWinAmount : 0,
                        accumulatedMultiplier : 0,
                        freeSpinCompleted : false
                    }

                    await this.databaseManager(freeSpinData);
                }

            }

            // we only gonna return updated free spin data not the inital free spin data
            return finalData
    }

    

    async startBet({ userId, betAmount, currency, clientSeed, serverSeed, nonce }) {
        
        const roundId = generateRoundId();
        const transactionId = generateTransactionId();
        let betAmountNum = Number(betAmount);

        const freeSpinStatus = await this.databaseManager.getFreeSpinStatus( userId );

        // if free spin is active, then we need to use the bet amount from the free spin status instead of the bet amount sent by the user
        betAmountNum = (freeSpinStatus?.hasFreeSpinStarted) ? Number(freeSpinStatus.betAmount) : betAmountNum;

        const [currentUserBalance] = await Promise.all([
            this.databaseManager.getBalance({ userId }),
            this.databaseManager.lockBet(userId),
        ]);


        try {

            // if free spin is not active, then we need to deduct the bet amount from the user's balance
            await Promise.all([
                this.databaseManager.createTransaction({ userId, betAmount, roundId, transactionId }),
                (freeSpinStatus?.hasFreeSpinStarted) ? null : this.databaseManager.updateBalance({ userId, balance: (currentUserBalance - betAmountNum).toFixed(2) }),
            ]);


            const { boardState, tumbles, multiplierPayoutStack, shouldStartFreeSpin } = await this.gameEngine.spinReel({ userId, clientSeed, serverSeed, nonce });
            
            const payout = this.organizeRespone({ boardState, tumbles, multiplierPayoutStack });
            
            // if free spin is active, then we need to update the free spin status with the new accumulated multiplier and total win amount
            const freeSpinMultiplier = (freeSpinStatus.hasFreeSpinStarted) ? (freeSpinStatus.accumulatedMultiplier + payout.totalMultiplierPayout) : 1;

            const winAmount = payout.totalWinMultiplier * betAmountNum * freeSpinMultiplier;
            const balanceAfterBetAmountDeduction = await this.databaseManager.getBalance({ userId });

            const newBalance = parseFloat((balanceAfterBetAmountDeduction + winAmount).toFixed(2));



            const freeSpinData = await this.handleFreeSpinUpdate(userId, betAmountNum, freeSpinStatus, payout.totalMultiplierPayout, winAmount, shouldStartFreeSpin.base, shouldStartFreeSpin.additional);

            await Promise.all([
                this.databaseManager.updateBalance({ userId, balance: newBalance }),
                this.databaseManager.completeTransaction({ userId, transactionId }),
                this.databaseManager.createUserHistory({ userId, betAmount, winAmount, roundId, transactionId, currency }),
            ]);

            return {
                message: "bet completed.",
                betInfo : {
                    betAmount,
                    winAmount,
                    newBalance,
                    roundId,
                    transactionId, 
                },
                
                boardInfo : {...payout},
                freeSpin : freeSpinData
                
            };
        } finally {
            await this.databaseManager.unlockBet(userId);
        }
    }
}


module.exports = BetEngine