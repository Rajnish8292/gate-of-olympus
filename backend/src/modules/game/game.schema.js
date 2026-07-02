


const z = require("zod")



const boardStateSchema = z.object({
    board : z.array(),
    boardId : z.string(),
    wildMultiplier : z.int()
})


const betBodySchema = z.object({
    userId : z.string(),
    betAmount : z.string(),
    currency : z.string()
});

module.exports = {
    boardStateSchema,
    betBodySchema
}