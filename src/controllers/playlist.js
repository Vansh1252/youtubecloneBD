const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const playlistmodel = require('../models/playlists.model.js');
const videosmodel = require('../models/videos.model.js');

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
    const userId = req.user._id;
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
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.body
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                const videos = await playlistmodel.aggregate([
                    {
                        $match: {
                            _id: new mongoose.Types.ObjectId(playlistId),
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
                    { $unwind: "$videodetails" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "uploaderDetails"
                        }
                    },
                    { $unwind: "$uploaderDetails" },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            description: 1,
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
    const { playlistId, videoId } = req.body
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                    const playlist = await playlistmodel.findOne({ _id: playlistId, owner: userId })
                    if (playlist != null) {
                        const video = await videosmodel.findById({ _id: videoId, owner: userId });
                        if (video.owner.equals(userId)) {
                            return responseManger.badrequest(res, "video not found...!");
                        }
                        if (video != null) {
                            const isvideoinplaylist = playlist.videos.some(vid => vid.equals(videoId));
                            if (isvideoinplaylist !== null) {
                                playlist.videos.push(videoId);
                                await playlist.save();
                                return responseManger.onsuccess(res, playlist, "video added successfully...!");
                            } else {
                                return responseManger.badrequest(res, "video is alreay in the playlist...!");
                            }
                        } else {
                            return responseManger.Notfound(res, "video not found...!")
                        }
                    } else {
                        return responseManger.Notfound(res, "no playlist found...!");
                    }
                } else {
                    return responseManger.badrequest(res, "videoId is Invalid...!");
                }
            } else {
                return responseManger.badrequest(res, "playlistId is Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.body;
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                    const playlist = await playlistmodel.findOne({ _id: playlistId, owner: userId })
                    if (playlist != null) {
                        const intitallength = playlist.videos.length;
                        const updatedplaylist = await playlistmodel.findByIdAndUpdate(
                            playlistId,
                            { $pull: { videos: videoId } },
                            { new: true }
                        );
                        if (updatedplaylist !== intitallength) {
                            return responseManger.onsuccess(res, updatedplaylist, "video remove successfully...!");
                        } else {
                            return responseManger.Notfound(res, "video not found in the playlist...!");
                        }
                    } else {
                        return responseManger.badrequest(res, "no playlist found...!");
                    }
                } else {
                    return responseManger.badrequest(res, "videoId is Invalid...!")
                }
            } else {
                return responseManger.badrequest(res, "playlistId is Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.body;
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (playlistId && mongoose.Types.ObjectId.isValid(playlistId)) {
                const deletePlaylist = await playlistmodel.findByIdAndUpdate(playlistId, { deleted: true }, { new: true });
                if (deletePlaylist != null) {
                    return responseManger.onsuccess(res, "playlist deleted successfully...!");
                } else {
                    return responseManger.Notfound(res, "playlist not found...!");
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
});

module.exports = { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist }