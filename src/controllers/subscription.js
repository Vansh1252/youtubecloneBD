const asyncHandler = require('../utils/asyncHandler.js');
const responseManger = require('../utils/responseManager.js');
const mongoose = require('mongoose');
const subscriptionmodel = require('../models/subscriptions.model.js');


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.body;
    try {
        if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
            if (userId.toString() === channelId.toString()) {
                return responseManger.badrequest(res, "Cannot subscribe to yourself");
            }
            if (channelId && mongoose.Types.ObjectId.isValid(channelId)) {
                const userId = req.user._id
                const existingSubscription = await subscriptionmodel.findOne({
                    subscriberId: userId,
                    channelId: channelId
                });
                let isSubscribed;
                if (existingSubscription) {
                    await subscriptionmodel.findByIdAndUpdate(existingSubscription._id, { deleted: true });
                    isSubscribed = false;
                } else {
                    const deletedsub = await subscriptionmodel.findOne({
                        subscriberId: userId,
                        channelId: channelId,
                        deleted: true
                    })
                    if (deletedsub) {
                        await subscriptionmodel.findByIdAndUpdate(deletedsub._id, { deleted: false });
                    } else {
                        await subscriptionmodel.create({
                            subscriberId: userId,
                            channelId: channelId
                        });
                        isSubscribed = true
                    }
                }
                return responseManger.onsuccess(res, isSubscribed, "Subscription status updated...!");
            } else {
                return responseManger.badrequest(res, "channelId is Invalid...!");
            }
        }
        else {
            return responseManger.Authorization(res, "credenitial are wrong...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    try {
        if (channelId && mongoose.Types.ObjectId.isValid(channelId)) {
            const subscription = await subscriptionmodel.find({
                channelId: channelId,
                deleted: true
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
    const { subscriberId } = req.params
    try {
        if (subscriberId && mongoose.Types.ObjectId.isValid(subscriberId)) {
            const allchannel = await subscriptionmodel.find({
                subscriberId: subscriberId,
                deleted: false
            })
                .populate({
                    path: "channelId",
                    select: 'username email avatar channelName',
                    match: { deleted: false }
                })
                .sort({ createdAt: -1 })
                .lean();
            if (allchannel > 0) {
                const channels = allchannel.map(sub => ({
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