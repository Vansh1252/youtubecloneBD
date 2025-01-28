const userModel = require("../models/user.models");
const asyncHandler = require("../utils/asyncHandler");
const responseManger = require('../utils/responseManager');
const jwt = require('jsonwebtoken');

const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accesstoken ||
            req.headers['authorization']?.split(" ")[1];

        if (!token) {
            return responseManger.badrequest(res, "Unauthorized: JWT token is required");
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return responseManger.badrequest(res, "Unauthorized: JWT token is invalid or expired");
    }
});

module.exports = verifyjwt;