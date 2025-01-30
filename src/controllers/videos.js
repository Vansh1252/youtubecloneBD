const asyncHandler = require('../utils/asyncHandler.js');
const videomodel = require('../models/videos.model.js');
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const usermodel = require('../models/users.model.js');
const responseManger = require('../utils/responseManager.js');
const { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } = require('../utils/cloudinary.js');
const mongoose = require('mongoose');

ffmpeg.setFfmpegPath(ffmpegStatic);


const getallvideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy, sortType, userId } = req.query;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            let query = { isPublished: true };
            let itemsperpage = parseInt(page);
            let currentpage = parseInt(limit);
            let sortOrder = sortType === "asc" ? 1 : -1;
            let sortQuery = { [sortBy]: sortOrder };

            if (search && search != null && search != undefined && typeof search === 'string' && search.trim() != '') {
                query.$or = [
                    {
                        title: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
                const video = await videomodel.find(search)
                    .sort(sortQuery)
                    .skip(currentpage - 1) * itemsperpage
                        .limit(itemsperpage)
                        .select("")

                const totalvideo = await videomodel.countDocuments(search);
                if (totalvideo.length > 0) {
                    return responseManger.onsuccess(res, { video, totalvideo, totalpages: Math.ceil(totalvideo / itemsperpage), currentpage: currentpage, itemsperpage }, "videos fetched successfulyy...!");
                } else {
                    return responseManger.badrequest(res, "no video found...!");
                }
            } else {
                return responseManger.badrequest(res, "no search found...!");
            }
        } else {
            return responseManger.badrequest(res, "userId is Invalid...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { thumbnail, title, description } = req.body
    try {
        if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
            if (title && title != null && title != undefined && typeof title === 'string' && title.trim() != '') {
                if (description && description != null && description != undefined && typeof description === 'string' && description.trim() != '') {
                    if (thumbnail && thumbnail != null && thumbnail != undefined && typeof thumbnail === 'string' && thumbnail.trim() != '') {
                        if (!req.files || !req.files.videofile?.[0] || !req.files.thumbnail?.[0]) {
                            return responseManger.badrequest(res, "files is required...!");
                        }
                        const videofilelocalpath = req.files?.videofile[0]?.path;
                        const thumbnailFile = req.files.thumbnail[0];
                        const getVideoDuration = (filePath) => new Promise((resolve) => {
                            ffmpeg.ffprobe(filePath, (err, metadata) => {
                                resolve(err ? 0 : Math.floor(metadata.format.duration || 0));
                            });
                        });

                        const [videoUpload, thumbnailUpload, duration] = await Promise.all([
                            uploadOnCloudinary(videofilelocalpath.path),
                            uploadOnCloudinary(thumbnailFile.path),
                            getVideoDuration(videofilelocalpath.path)
                        ]);
                        if (videofiles) {
                            const video = new videomodel({
                                videofile: videoUpload.url,
                                thumbnail: thumbnailUpload.url,
                                title: title.trim(),
                                description,
                                duration: duration,
                                owner: req.user._id
                            });
                            await video.save();

                            return responseManger.onsuccess(res, "video published successfully...!");
                        } else {
                            return responseManger.badrequest(res, "videofiles is required...!")
                        }
                    } else {
                        return responseManger.badrequest(res, "thumbnail is required...!");
                    }
                } else {
                    return responseManger.badrequest(res, "description is required...!");
                }
            } else {
                return responseManger.badrequest(res, "title is required...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    try {
        if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
            const user = await usermodel.findById(req.user._id)
            if (user === null) {
                return responseManger.Authorization(res, "user not found...!");
            }
            if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                const video = await videomodel.findById(videoId).populate({ path: 'owner', select: 'username avatar subscribersCount' });
                if (video != null) {
                    if (video.isPublished != null && video.owner._id.equals(req.user._id)) {
                        if (!video.owner._id.equals(req.user._id)) {
                            await videomodel.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
                            video.views += 1;
                        }
                        const responseData = {
                            _id: video._id,
                            title: video.title,
                            description: video.description,
                            duration: video.duration,
                            views: video.views,
                            isPublished: video.isPublished,
                            createdAt: video.createdAt,
                            videofile: video.videofile,
                            thumbnail: video.thumbnail,
                            owner: {
                                _id: video.owner._id,
                                username: video.owner.username,
                                avatar: video.owner.avatar,
                                subscribersCount: video.owner.subscribersCount
                            }
                        };
                        return responseManger.onsuccess(res, responseData, "video statred...!");
                    } else {
                        return responseManger.Authorization(res, "You don't have permission to view this video");
                    }
                } else {
                    return responseManger.badrequest(res, "video not found...!");
                }
            } else {
                return responseManger.badrequest(res, "Invalid videoId...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description, } = req.body;
    const thumbnailfile = req.file;
    try {
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
            const video = await videomodel.findOne({ _id: videoId, owner: req.user._id });
            if (video != null) {
                const updates = {};
                if (title && title != null && title != undefined && typeof title === 'string' && title.trim() != '') {
                    if (description && description != null && description != undefined && typeof description === 'string' && description.trim() != '') {
                        if (thumbnail && thumbnail != null && thumbnail != undefined && typeof thumbnail === 'string' && thumbnail.trim() != '') {

                        } else {
                            return responseManger.badrequest(res, "thumbnail is required...!");
                        }
                    } else {
                        return responseManger.badrequest(res, "description is required...!");
                    }
                } else {
                    return responseManger.badrequest(res, "title is required...!");
                }
            } else {
                return responseManger.notfound(res, "Video not found or unauthorized");
            }
        } else {
            return responseManger.badrequest(res, "Invalid videoId...!")
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
            const video = await videomodel.findByIdAndUpdate({
                _id: videoId,
                owner: req.user._id
            }, { deleted: true });
            if (video != null) {
                const videopulicId = extractPublicId(video.videofile);
                const thumbnailpublicId = extractPublicId(video.thumbnail);
                await Promise.all([
                    deleteFromCloudinary(videopulicId),
                    deleteFromCloudinary(thumbnailpublicId)
                ]);
                return responseManger.success(res, null, "Video deleted successfully");
            } else {
                return responseManger.badrequest(res, "Video not found or unauthorized")
            }
        } else {
            return responseManger.servererror(res, "Something went wrong...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
            const video = await videomodel.findOne({
                _id: videoId,
                owner: req.user._id
            });
            if (video != null) {
                video.isPublished = video.isPublished === true ? false : true;
                await video.save();
                return responseManger.onsuccess(res, { isPublished: video.isPublished }, "Publish status updated");
            } else {
                return responseManger.badrequest(res, "Video not found or unauthorized")
            }
        } else {
            return responseManger.badrequest(res, "videoId is Invalid...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});


module.exports = { getallvideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }