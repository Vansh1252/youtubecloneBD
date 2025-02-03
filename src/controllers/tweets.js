const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const tweetmodel = require('../models/tweets.model.js');

const save = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { tweetId, content } = req.body;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (content && content != null && content != undefined && typeof content === 'string' && content.trim() != '') {
                if (tweetId && mongoose.Types.ObjectId.isValid(tweetId)) {
                    const updates = { content };
                    const existingtweet = await tweetmodel.findByIdAndUpdate(tweetId, updates, { new: true }).lean();
                    if (existingtweet != null) {
                        return responseManger.onsuccess(res, "tweet updated successfully...!");
                    } else {
                        return responseManger.badrequest(res, "tweet not found for update...!");
                    }
                } else {
                    const createtweet = await tweetmodel.create({
                        content: content.trim(),
                        owner: userId
                    });
                    return responseManger.created(res, createtweet, "tweet added successfully...!");
                }
            } else {
                return responseManger.badrequest(res, "content Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "Something went worng...!");
    }
});

const getUsertweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const tweet = await tweetmodel.find({
                owner: userId,
                deleted: false
            }).populate("owner", "username email avatar")
                .select("-deleted ")
            if (tweet.length > 0) {
                const tweets = tweet.map(tw => ({
                    _id: tw.owner._id,
                    username: tw.owner?.username,
                    email: tw.owner?.email,
                    avatar: tw.owner.avatar,
                    content: tw.content
                }));
                return responseManger.onsuccess(res, { count: tweets.length, tweets }, "fetched successfully...!");
            } else {
                return responseManger.onsuccess(res, "You haven't tweet yet...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invaild...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const deletetweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.body;
    const userId = req.user._id;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        if (tweetId && mongoose.Types.ObjectId.isValid(tweetId)) {
            const tweet = await tweetmodel.findByIdAndUpdate(tweetId, { deleted: true }, { new: true }).lean();
            if (tweet != null) {
                return responseManger.onsuccess(res, "deleted successfully...!");
            } else {
                return responseManger.badrequest(res, "tweet not found to delete...!");
            }
        } else {
            return responseManger.badrequest(res, "tweetId is Invaild...!");
        }
    } else {
        return responseManger.Authorization(res, "userId is Invalid...!");
    }
});


module.exports = { save, getUsertweets, deletetweet };