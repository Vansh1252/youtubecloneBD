const mongoose = require('mongoose');


const tweetschema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

},
    { timestamps: true });


const tweetmodel = mongoose.model("tweets", "tweetschema");

module.exports = tweetmodel;