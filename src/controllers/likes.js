const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const likesmodel = require('../models/likes.model.js');



const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            let islike = false;
            if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                const existingvideolike = await likesmodel.findOne({
                    video: videoId,
                    likedBy: userId
                });
                if (existingvideolike) {
                    await likesmodel.findByIdAndDelete(existingvideolike._id, { likedBy: userId }, { new: true });
                    islike = false;
                }
                else {
                    await likesmodel.create({
                        video: videoId,
                        likedBy: userId
                    });
                    islike = true
                }
                return responseManger.onsuccess(res, { isLiked: islike }, "likes status updated...!");
            } else {
                return responseManger.badrequest(res, "videoId is Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went worng...!");
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.body;
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (commentId && mongoose.Types.ObjectId.isValid(commentId)) {
                const existingcommentlikes = await likesmodel.findOne({
                    comment: commentId,
                    likedBy: userId
                });
                let islike;
                if (existingcommentlikes) {
                    await likesmodel.findByIdAndDelete(existingcommentlikes._id);
                    islike = false;
                } else {
                    await likesmodel.create({
                        comment: commentId,
                        likedBy: userId
                    });
                    islike = true
                }
                return responseManger.onsuccess(res, islike, "likes status updated...!");
            } else {
                return responseManger.badrequest(res, "commentId is Invalid...!");
            }
        }
        else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "Something went worng...!");
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.body;
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (tweetId && mongoose.Types.ObjectId.isValid(tweetId)) {
                const existingtweetlike = await likesmodel.findOne({
                    tweet: tweetId,
                    likedBy: userId
                });
                let islike;
                if (existingtweetlike != null) {
                    await likesmodel.findByIdAndDelete(existingtweetlike._id);
                    islike = false;
                } else {
                    await likesmodel.create({
                        tweet: tweetId,
                        likedBy: userId
                    });
                    islike = true
                }
                return responseManger.onsuccess(res, islike, "likes status updated...!");
            } else {
                return responseManger.badrequest(res, "tweetId is Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went worng...!");
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const alllikevideo = await likesmodel.aggregate([
                {
                    $match: {
                        likedBy: mongoose.Types.ObjectId(userId),
                        video: { $exists: true },
                        deleted: false
                    }
                },
                {
                    $lookup: {
                        from: "videos",
                        localField: "videos",
                        foreignField: "_id",
                        as: "videodetails"
                    }
                },
                { $unwind: "videodetails" },
                {
                    $lookup: {
                        from: "users",
                        localField: "videodetails.owner",
                        foreignField: "_id",
                        as: "uploaderDetails"
                    }
                },
                { $unwind: "uploaderDetails" },
                {
                    $project: {
                        _id,
                        likedAt: "$createdAt",
                        video: {
                            _id: "$videodetails._id",
                            title: "$videodetails.title",
                            thumbnail: "$videodetails.thumbnail",
                            description: "$videodetails.description",
                            duration: "$videodetails.duration",
                            views: "$videodetails.views",
                        },
                        owner: {
                            _id: "$uploaderDetails._id",
                            username: "$uploaderDetails.username",
                            avatar: "$uploaderDetails.avatar",
                        }
                    }
                },
                { $sort: { likedAt: -1 } }
            ]);

            if (alllikevideo.length > 0) {
                return responseManger.onsuccess(res, { count: alllikevideo.length, alllikevideo }, "liked video fetched successfully...!");
            } else {
                return responseManger.onsuccess(res, "No liked videos found...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});


module.exports = { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };