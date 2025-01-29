const mongoose = require('mongoose');


const commentsschema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { timestamps: true })

const commentmodel = mongoose.model("comments", commentsschema);
module.exports = commentmodel