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
    const { page, limit, search, sortBy, sortType } = req.body;
    try {
        const userId = req.user._id;
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
            }
            const video = await videomodel.find(query)
                .sort(sortQuery)
                .skip((currentpage - 1) * itemsperpage)
                .limit(itemsperpage)
                .select("videoFile thumbnail title duration views")
                .populate({ path: 'owner', select: 'username avatar subscribersCount' })
                .lean();

            const totalvideo = await videomodel.countDocuments(query);
            return responseManger.onsuccess(res, { video, totalvideo, totalpages: Math.ceil(totalvideo / itemsperpage), currentpage: currentpage, itemsperpage }, "videos fetched successfulyy...!");
        } else {
            return responseManger.badrequest(res, "userId is Invalid...!");
        }
    } catch (error) {
        console.log('Error fetching videos:', error);
        return responseManger.servererror(res, "Something went wrong...!");
    }
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    try {
        if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
            if (title && title.trim() !== '') {
                if (description && description.trim() !== '') {
                    if (!req.files || !req.files.videofile?.[0] || !req.files.thumbnail?.[0]) {
                        return responseManger.badrequest(res, "files are required...!");
                    }
                    const videofilelocalpath = req.files.videofile[0].path;
                    const thumbnailFile = req.files.thumbnail[0].path;
                    const [videoUpload, thumbnailUpload] = await Promise.all([
                        uploadOnCloudinary(videofilelocalpath),
                        uploadOnCloudinary(thumbnailFile),
                    ]);
                    if (!videoUpload?.url) {
                        return responseManger.badrequest(res, "Error uploading video file...!");
                    }
                    if (!thumbnailUpload?.url) {
                        return responseManger.badrequest(res, "Error uploading thumbnail file...!");
                    }
                    const video = new videomodel({
                        videofile: videoUpload.url,
                        thumbnail: thumbnailUpload.url,
                        title: title.trim(),
                        description,
                        duration: videoUpload.duration,
                        owner: req.user._id
                    });
                    await video.save();
                    return responseManger.onsuccess(res, "video published successfully...!");
                } else {
                    return responseManger.badrequest(res, "description is required...!");
                }
            } else {
                return responseManger.badrequest(res, "title is required...!");
            }
        } else {
            return responseManger.badrequest(res, "Invalid user ID...!");
        }
    } catch (error) {
        return responseManger.badrequest(res, "Error processing video...!");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
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
    const { videoId, title, description, } = req.body;
    console.log(req.body);
    try {
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
            const video = await videomodel.findOne({ _id: videoId, owner: req.user._id });
            if (video != null) {
                const updates = {};
                if (title && title != null && title != undefined && typeof title === 'string' && title.trim() != '') {
                    updates.title = title;
                    if (description && description != null && description != undefined && typeof description === 'string' && description.trim() != '') {
                        updates.description = description;
                        if (thumbnailfile) {
                            const thumbnailUpload = await uploadOnCloudinary(thumbnailfile.path);
                            if (thumbnailUpload.url) {
                                const thumbnailpublicId = extractPublicId(video.thumbnail);
                                await deleteFromCloudinary(thumbnailpublicId);
                                updates.thumbnail = thumbnailUpload.url;
                            } else {
                                return responseManger.badrequest(res, "Error uploading thumbnail file...!");
                            }
                        }
                        await videomodel.findByIdAndUpdate(videoId, updates);
                        return responseManger.onsuccess(res, null, "Video updated successfully");

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
    const { videoId } = req.body;
    try {
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
            const video = await videomodel.findByIdAndUpdate({
                _id: videoId,
                owner: req.user._id
            }, { deleted: true });
            if (video != null) {
                return responseManger.success(res, null, "Video deleted successfully");
            } else {
                return responseManger.badrequest(res, "Video not found or unauthorized")
            }
        } else {
            return responseManger.servererror(res, "Something went wrong...!");
        }
    } catch (error) {
        console.log('Error deleting video:', error);
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.body
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









// const publishAVideos = asyncHandler(async (req, res) => {
//     const { title, description } = req.body;
//     try {
//         if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
//             if (title && title.trim() !== '') {
//                 if (description && description.trim() !== '') {
//                     if (!req.files || !req.files.videofile?.[0] || !req.files.thumbnail?.[0]) {
//                         return responseManger.badrequest(res, "files are required...!");
//                     }
//                     const videofilelocalpath = req.files.videofile[0].path;
//                     const thumbnailFile = req.files.thumbnail[0].path;

//                     console.log("Video File Path:", videofilelocalpath);
//                     console.log("Thumbnail File Path:", thumbnailFile);
//                     const getVideoDuration = (filePath) => new Promise((resolve) => {
//                         ffmpeg.ffprobe(filePath, (err, metadata) => {
//                             resolve(err ? 0 : Math.floor(metadata.format.duration || 0));
//                         });
//                     });

//                     const [videoUpload, thumbnailUpload, duration] = await Promise.all([
//                         uploadOnCloudinary(videofilelocalpath),
//                         uploadOnCloudinary(thumbnailFile),
//                         getVideoDuration(videofilelocalpath)
//                     ]);

//                     console.log("Video Upload Response:", videoUpload);
//                     console.log("Thumbnail Upload Response:", thumbnailUpload);
//                     console.log("Extracted Duration:", duration);

//                     if (!videoUpload?.url) {
//                         return responseManger.badrequest(res, "Error uploading video file...!");
//                     }
//                     if (!thumbnailUpload?.url) {
//                         return responseManger.badrequest(res, "Error uploading thumbnail file...!");
//                     }

//                     const video = new videomodel({
//                         videofile: videoUpload.url,
//                         thumbnail: thumbnailUpload.url,
//                         title: title.trim(),
//                         description,
//                         duration: duration,
//                         owner: req.user._id
//                     });
//                     await video.save();
//                     return responseManger.onsuccess(res, "video published successfully...!");
//                 } else {
//                     return responseManger.badrequest(res, "description is required...!");
//                 }
//             } else {
//                 return responseManger.badrequest(res, "title is required...!");
//             }
//         } else {
//             return responseManger.badrequest(res, "Invalid user ID...!");
//         }
//     } catch (error) {
//         console.error('Error processing video:', error);
//         return responseManger.badrequest(res, "Error processing video...!");
//     }
// });