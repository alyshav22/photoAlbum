var mongoose = require('mongoose');

var PhotoSchema = {
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
    albumid: String,
    description: String,
    likes: Number,
    state: String
};

mongoose.model('Photo', PhotoSchema);
module.exports = mongoose.model('Photo');