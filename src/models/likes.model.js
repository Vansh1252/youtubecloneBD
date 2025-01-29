const mongoose = require('mongoose');


const likesschema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos",
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
        required: true
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tweets",
        required: true
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
}, { timestamps: true })

const likesmodel = mongoose.model("likes", likesschema);
module.exports = likesmodel