const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const subscriptionmodel = require('../models/subscriptions.model.js');
const userModel = require('../models/users.model.js');


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.body;
    const userId = req.user._id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return responseManger.Authorization(res, "Invalid credentials");
        }
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return responseManger.badrequest(res, "Invalid channel ID");
        }
        const userIdStr = userId.toString();
        const channelIdStr = channelId.toString();
        if (userIdStr === channelIdStr) {
            return responseManger.badrequest(res, "Cannot subscribe to yourself");
        }
        const channelExists = await userModel.exists({ _id: channelId });
        if (!channelExists) {
            return responseManger.badrequest(res, "Channel does not exist");
        }
        const existingSubscription = await subscriptionmodel.findOne({
            subscriberId: userId,
            channelId: channelId
        });
        let isSubscribed;
        if (existingSubscription) {
            const newStatus = !existingSubscription.deleted;
            await subscriptionmodel.findByIdAndUpdate(
                existingSubscription._id,
                { deleted: newStatus }
            );
            isSubscribed = newStatus;
        } else {
            await subscriptionmodel.create({
                subscriberId: userId,
                channelId: channelId,
                deleted: false
            });
            isSubscribed = true;
        }
        return responseManger.onsuccess(
            res,
            { subscribed: isSubscribed },
            "Subscription status updated successfully"
        );
    } catch (error) {
        console.error("Subscription error:", error);
        return responseManger.servererror(res, "Internal server error");
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.body;
    try {
        if (channelId && mongoose.Types.ObjectId.isValid(channelId)) {
            const subscription = await subscriptionmodel.find({
                channelId: channelId,
                deleted: false
            })
                .populate("subscriberId", "username email avatar subscriberCount")
                .sort({ createdAt: -1 })
                .lean();
            const validsubscriptions = subscription.filter(sub => sub.subscriberId);

            const subscribers = validsubscriptions.map(sub => ({
                _id: sub.subscriberId._id,
                username: sub.subscriberId.username,
                avatar: sub.subscriberId.avatar,
                subscribedAt: sub.createdAt
            }));
            return responseManger.onsuccess(res, { count: subscribers.length, subscribers }, "fetched successfully...!");
        } else {
            return responseManger.Authorization(res, "Invalid channel ID...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.body
    try {
        if (subscriberId && mongoose.Types.ObjectId.isValid(subscriberId)) {
            const allSubscriptions = await subscriptionmodel.find({
                subscriberId: subscriberId,
                deleted: false
            })
                .populate({
                    path: "channelId",
                    select: 'username email avatar channelName',
                })
                .sort({ createdAt: -1 })
                .lean();
            if (allSubscriptions.length > 0) {
                const channels = allSubscriptions
                    .filter(sub => sub.channelId)
                    .map(sub => ({
                        _id: sub.channelId._id,
                        username: sub.channelId.username,
                        channelName: sub.channelId.channelName,
                        avatar: sub.channelId.avatar,
                        subscribedAt: sub.createdAt
                    }));
                return responseManger.onsuccess(res, { count: channels.length, channels }, "channel fetched successfully...!");
            } else {
                return responseManger.badrequest(res, "no channel subscribed by user...!");
            }
        } else {
            return responseManger.Authorization(res, "Invalid subscription ID...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

module.exports = { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }