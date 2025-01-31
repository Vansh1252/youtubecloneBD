const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const commentmodel = require('../models/comments.model.js');


const getvideocomment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.body;
    try {
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
            let itemsperpage = parseInt(page);
            let currentpage = parseInt(limit);
            const comment = await commentmodel.find({ videoId }).populate("owner", "username").skip(currentpage - 1) * itemsperpage.limit(itemsperpage).sort({ createdAt: -1 }).select("-deleted -videoId -updatedAt -_v").lean();
            const totalcomment = await commentmodel.countDocuments({ videoId });
            if (comment.length > 0) {
                return responseManger.onsuccess(res, { totalcomment, comment, totalpages: Math.ceil(totalcomment / itemsperpage), currentpage: currentpage, itemsperpage }, "comment on the video...!");
            } else {
                return responseManger.onsuccess(res, "No comment found...!");
            }
        } else {
            return responseManger.badrequest(res, "Invalid videoId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const save = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { commentId, content } = req.body;
    try {
        const userId = req.user._id;
        if (userId && mongoose.Types.ObjectId.isValid) {
            if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
                if (content && content != null && content != undefined && typeof content === 'string' && content.trim() != '') {
                    if (commentId && mongoose.Types.ObjectId.isValid(commentId)) {
                        const existingcomment = await commentmodel.findByIdAndUpdate(commentId, { content: content.trim() }, { new: true }).lean();
                        if (existingcomment != null) {
                            return responseManger.onsuccess(res, "comment updated successfully...!");
                        } else {
                            return responseManger.badrequest(res, "comment not found for update...!");
                        }
                    } else {
                        const newcomment = new commentmodel({
                            content: content.trim(),
                            videoId: videoId,
                            owner: userId
                        });
                        await newcomment.save();
                        return responseManger.onsuccess(res, "comment add successfully...!");
                    }
                } else {
                    return responseManger.badrequest(res, "content is required...!");
                }
            } else {
                return responseManger.badrequest(res, "videoId is Invalid...!");
            }
        } else {
            return responseManger.Authorization(res, "userId is Invalid...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Somenthing went wrong...!");
    }
});

const deletecomment = asyncHandler(async (req, res) => {
    const { commentId } = req.body;
    const userId = req.user._id;
    try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            if (commentId && mongoose.Types.ObjectId.isValid(commentId)) {
                const comment = await commentmodel.findById(commentId);
                if (comment != null) {
                    comment.deleted = true;
                    return responseManger.onsuccess(res, "comment deleted successfully...!")
                } else {
                    return responseManger.badrequest(res, "comment not found for deleting...!");
                }
            } else {
                return responseManger.badrequest(res, "Invalid commentId...!")
            }
        } else {
            return responseManger.Authorization(res, "Invalid userId...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

module.exports = { getvideocomment, save, deletecomment };