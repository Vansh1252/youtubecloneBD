const asyncHandler = require('../utils/asyncHandler.js');

const registeruser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "ok" });
})



module.exports = { registeruser }