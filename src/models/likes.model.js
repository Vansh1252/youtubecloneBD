const mongoose = require('mongoose');


const likesschema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos",
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tweets",
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
}, { timestamps: true })

const likesmodel = mongoose.model("likes", likesschema);
module.exports = likesmodel