const mongoose = require('mongoose');


const commentsschema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const commentmodel = mongoose.model("comments", commentsschema);
module.exports = commentmodel