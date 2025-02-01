const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');

const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const resopnse = "everthing is Ok...!";
            return responseManger.onsuccess(res, resopnse, "successfully check");
        } else {
            return responseManger.Authorization(res, "userId is Invaild...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
})


module.exports = healthcheck