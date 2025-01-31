const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        requried: true
    },
    description: {
        type: String,
        requried: true
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "videos"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const playlistmodel = mongoose.model("playlists", playlistSchema);
module.exports = playlistmodel;