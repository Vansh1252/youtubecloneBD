const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })



subscriptionSchema.pre('save', async function (next) {
    const existing = await this.constructor.findOne({
        subscriberId: this.subscriberId,
        channelId: this.channelId,
        deleted: false
    });

    if (existing) {
        const err = new Error('Subscription already exists');
        err.name = 'DuplicateSubscription';
        next(err);
    } else {
        next();
    }
});

const subscriptionmodel = mongoose.model("subscription", subscriptionSchema);

module.exports = subscriptionmodel