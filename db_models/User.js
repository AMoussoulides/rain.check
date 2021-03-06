const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Creating User Schema and fields
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date_registered: {
        type: Date,
        default: Date.now
    }
});


module.exports = User = mongoose.model('user', UserSchema);