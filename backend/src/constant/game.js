const gameConfig = {
    minBetAmount : 20,
    maxBetAmount : 20000,

    reels : 6,
    row : 5,
    
    symbolName: {
        CROWN : "CROWN",
        HOURGLASS: "HOURGLASS",
        RING: "RING",
        GOBLET: "GOBLET",
        REDGEM: "REDGEM",
        PURPLEGEM: "PURPLEGEM",
        YELLOWGEM: "YELLOWGEM",
        GREENGEM: "GREENGEM",
        BLUEGEM: "BLUEGEM",
        SCATTER: "SCATTER",
        MULTIPLIER: "MULTIPLIER"
    },


    symbols: { 

        CROWN:      { probability: 0.0409, payout: {"8_9": 10,   "10_11": 25,   "12_30": 50} },
        HOURGLASS:  { probability: 0.0546, payout: {"8_9": 2.5,  "10_11": 10,   "12_30": 25} },
        RING:       { probability: 0.0636, payout: {"8_9": 2,    "10_11": 5,    "12_30": 15} },
        GOBLET:     { probability: 0.0772, payout: {"8_9": 1.5,  "10_11": 2,    "12_30": 12} },

        REDGEM:     { probability: 0.1182, payout: {"8_9": 1,    "10_11": 1.5,  "12_30": 10} },
        PURPLEGEM:  { probability: 0.1318, payout: {"8_9": 0.80, "10_11": 1.20, "12_30": 8} },
        YELLOWGEM:  { probability: 0.1455, payout: {"8_9": 0.50, "10_11": 1,    "12_30": 5} },
        GREENGEM:   { probability: 0.1591, payout: {"8_9": 0.4,  "10_11": 0.9,  "12_30": 4} },
        BLUEGEM:    { probability: 0.1818, payout: {"8_9": 2,    "10_11": 0.75, "12_30": 2} },

        SCATTER:    { probability: 0.0136, payout: {"6_30": 100,  "5_5": 5,      "4_4": 3} },
        MULTIPLIER: { probability: 0.0136, payout: {"1_30": 1} }
    },

    MULTIPLIER_PAYOUT : {
        "2x":   {probability: 0.2415, payout: 2},
        "3x":   {probability: 0.1449, payout: 3},
        "4x":   {probability: 0.0725, payout: 4},
        "5x":   {probability: 0.0242, payout: 5},
        "6x":   {probability: 0.0048, payout: 6},
        "8x":   {probability: 0.2415, payout: 8},
        "10x":  {probability: 0.1449, payout: 10},
        "12x":  {probability: 0.0725, payout: 12},
        "15x":  {probability: 0.0242, payout: 15},
        "20x":  {probability: 0.0048, payout: 20},
        "25x":  {probability: 0.0048, payout: 25},
        "50x":  {probability: 0.0048, payout: 50},
        "100x": {probability: 0.0048, payout: 100},
        "250x": {probability: 0.0048, payout: 250},
        "500x": {probability: 0.0048, payout: 500}
    },

    freespin: {
        base : {spin : 15, count : 4}, // if 3 or more scatter appears, then give 15 free spin with 5x multiplier
        additional: {spin: 4, count: 3}, // if 3 or more scatter appears in free spin, then give 4 additional free spin with 3x multiplier
    }, 

    rtp : {
        theortical : null,
        practical : null
    }

}


module.exports = {
    gameConfig
}

