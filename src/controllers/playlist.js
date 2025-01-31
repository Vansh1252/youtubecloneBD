const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const playlistmodel = require('../models/playlists.model.js');

const createPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, name, description } = req.body
    const userId = req.user._id;
    try {
        if (mongoose.Types.ObjectId.isValid(userId)) {
            if (name && name != null && name != undefined && typeof name === 'string' && name.trim() != '') {
                if (description && description != null && description != undefined && typeof description === 'string' && description.trim() != '') {
                    if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                        const updates = { name, description };
                        const existingpaylist = await playlistmodel.findByIdAndUpdate(playlistId, updates, { new: true, runValidators: true });
                        if (existingpaylist != null) {
                            return responseManger.onsuccess(res, "playlist updated successfully...!");
                        } else {
                            return responseManger.badrequest(res, "playlist not found...!");
                        }
                    } else {
                        const playlist = new playlistmodel({
                            name: name.trim(),
                            description: description.trim(),
                            owner: userId
                        });
                        await playlist.save();
                        return responseManger.onsuccess(res, playlist, "playlist created successfully...!");
                    }
                } else {
                    return responseManger.badrequest(res, "description is required...!");
                }
            } else {
                return responseManger.badrequest(res, "name is required...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const playlist = await playlistmodel.find({
                owner: userId,
                deleted: false
            }).select("name description createdAt").lean();
            if (playlist.length > 0) {
                const playlists = playlist.map(play => ({
                    id: play._id,
                    name: play.name,
                    description: play.description,
                    created_at: play.createdAt
                }));
                return responseManger.onsuccess(res, playlists, "playlists fetched successfully...!");
            } else {
                return responseManger.Notfound(res, "No playlist found...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                const videos = await playlistmodel.aggregate([
                    {
                        $match: {
                            _id: playlistId,
                            owner: mongoose.Types.ObjectId(userId)
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
                            name,
                            description,
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
                    { $sort: { createdAt: -1 } }
                ]);
                if (videos.length > 0) {
                    return responseManger.onsuccess(res, { count: videos.length, videos }, " fetched successfully...!");
                } else {
                    return responseManger.Notfound(res, "No playlist found...!");
                }
            } else {
                return responseManger.badrequest(res, "playlistId is required...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invaild...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                    
                }
            } else {
                return responseManger.badrequest(res, "playlistId is Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
})




module.exports = { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist }