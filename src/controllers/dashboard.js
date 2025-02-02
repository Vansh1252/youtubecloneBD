const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const commentmodel = require('../models/comments.model.js');
const likesmodel = require('../models/likes.model.js');
const subscriptionmodel = require('../models/subscriptions.model.js');
const videosmodel = require('../models/videos.model.js');


const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const videoStats = await videosmodel.aggregate([
                { $match: { owner: userId, deleted: false } },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: "$views" },
                        totalVideos: { $sum: 1 }
                    }
                }
            ]);

            const totalview = videoStats.length > 0 ? videoStats[0].totalViews : 0;
            const totalvideo = videoStats.length > 0 ? videoStats[0].totalVideos : 0;
            const totalSubscribers = await subscriptionmodel.countDocuments({
                channelId: userId,
                deleted: false
            });
            const videoIds = await videosmodel.distinct("_id", { owner: userId });
            const totalLikes = await likesmodel.countDocuments({
                video: { $in: videoIds },
                deleted: false
            });
            return responseManger.onsuccess(res, "Channel statistics retrieved successfully!", {
                totalview,
                totalvideo,
                totalSubscribers,
                totalLikes
            });
        } else {
            return responseManger.Authorization(res, "userId is Invaild...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const obj1 = {
                owner: userId,
                deleted: false
            };
            const totalvideos = await videosmodel.find(obj1).populate("owner", "username avatar coverImage ").select("thumbnail title description duration views owner").lean().sort({ createdAt: -1 });
            if (totalvideos.length > 0) {
                return responseManger.onsuccess(res, { count: totalvideos.length, totalvideos }, "total video fetched...!");
            } else {
                return responseManger.onsuccess(res, { count: 0 }, "No video uploaded by the channel...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invaild...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

module.exports = { getChannelStats, getChannelVideos }