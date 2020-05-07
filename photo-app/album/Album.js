var mongoose = require('mongoose');

var AlbumSchema = {
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    time: { type: Date, default: Date.now },
    username: {
        type: String,
        required: true,
    },
    photos: [],
    coverid: String,
    description: String,
    likes: Number,
    state: String
};

mongoose.model('Album', AlbumSchema);
module.exports = mongoose.model('Album');

