const mongoose = require('mongoose');


const tweetschema = new mongoose.Schema({
    
},
{ timestamps: true });


const tweetmodel =mongoose.model("tweets","tweetschema");

module.exports =tweetmodel;