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
            let query = { userId: userId };
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
            const user = await usermodel.findById(req.user._id)
            if (user === null) {
                return responseManger.badrequest(res, "user not found...!");
            }
            if (title && title != null && title != undefined && typeof title === 'string' && title.trim() != '') {
                if (description && description != null && description != undefined && typeof description === 'string' && description.trim() != '') {
                    if (thumbnail && thumbnail != null && thumbnail != undefined && typeof thumbnail === 'string' && thumbnail.trim() != '') {
                        if (!req.files) {
                            return responseManger.badrequest(res, "files is required...!");
                        }
                        let videofilelocalpath = req.files?.videofile[0]?.path;
                        const getVideoDuration = (filePath) => {
                            return new Promise((resolve, reject) => {
                                ffmpeg.ffprobe(filePath, (err, metadata) => {
                                    if (err) return reject("Error extracting video metadata");
                                    resolve(metadata.format.duration);
                                });
                            });
                        };
                        const durationInSeconds = await getVideoDuration(videofilelocalpath);
                        if (videofilelocalpath) {
                            const videofiles = await uploadOnCloudinary(videofilelocalpath);
                            if (videofiles) {
                                const video = new videomodel({
                                    videofile: videofiles.url,
                                    thumbnail,
                                    title,
                                    description,
                                    duration: durationInSeconds,
                                    owner: req.user._id
                                });
                                await video.save();
                                return responseManger.onsuccess(res, "video added successfully...!");
                            } else {
                                return responseManger.badrequest(res, "videofiles is required...!")
                            }
                        } else {
                            return responseManger.badrequest(res, "videofile is required...!");
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
    const { videoId } = req.params
    try {
        if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
            const user = await usermodel.findById(req.user._id)
            if (user === null) {
                return responseManger.Authorization(res, "user not found...!");
            }
            if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                const video = await videomodel.findById(videoId).select("");

            } else {
                return responseManger.badrequest(res, "Invalid videoId...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
})


module.exports = { getallvideos, publishAVideo }