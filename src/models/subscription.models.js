const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { timestamps: true })


const subscriptionmodel = mongoose.model("subscription", subscriptionSchema);

module.exports = subscriptionmodel