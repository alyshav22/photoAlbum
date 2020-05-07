var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: String
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');