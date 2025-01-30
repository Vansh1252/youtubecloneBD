const mongoose = require('mongoose');

const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const videoschema = new mongoose.Schema({
    videofile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


videoschema.plugin(mongooseAggregatePaginate)


const videomodel = mongoose.model('videos', videoschema);

module.exports = videomodel;