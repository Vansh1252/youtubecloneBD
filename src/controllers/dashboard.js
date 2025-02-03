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
                {
                    $match:
                    {
                        owner: new mongoose.Types.ObjectId(userId),
                        deleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: "$views" },
                        totalVideos: { $sum: 1 }
                    }
                }
            ]);
            const totalSubscribers = await subscriptionmodel.countDocuments({
                channelId: userId,
                deleted: false
            });
            const likeStats = await videosmodel.aggregate([
                {
                    $match:
                    {
                        owner: new mongoose.Types.ObjectId(userId),
                        deleted: false
                    }
                },
                {
                    $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "video",
                        as: "likes"
                    }
                },
                {
                    $project: {
                        totalLikes: { $size: "$likes" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalLikes: { $sum: "$totalLikes" }
                    }
                }
            ]);
            const totalview = videoStats.length > 0 ? videoStats[0].totalViews : 0;
            const totalvideo = videoStats.length > 0 ? videoStats[0].totalVideos : 0;
            const totalLikes = likeStats.length > 0 ? likeStats[0].totalLikes : 0;
            return responseManger.onsuccess(res, {
                totalview,
                totalvideo,
                totalSubscribers,
                totalLikes
            }, "Channel statistics retrieved successfully!");
        } else {
            return responseManger.Authorization(res, "userId is Invaild...!");
        }
    } catch (error) {
        console.log(error);
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