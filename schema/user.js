var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var userSchema = new Schema({
    confirmedEmail: Boolean,
    firstName: String,
    lastName: String,
    middleName: String,
    preferredName: String,
    username: String,
    password: String,
    profileImage: String,
    created: { type: Date, default: Date.now },
    email: String,
    social: {
        fb: String,
        twitter: String
    }
});

module.exports = userSchema;
