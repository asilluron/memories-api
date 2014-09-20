var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var momentSchema = new Schema({
    memory: {type: ObjectId, ref: "Memory"},
    creator: {type: ObjectId, ref: "User"},
    createdDate: {
        type: Date,
        default: Date.now
    },
    text: String,
    imageUrl: String,
    videoUrl: String,
    modifiedDate: {
        type: Date,
        default: Date.now
    },
    location: {
        name: String,
        gps: {
            lat: String,
            long: String
        },
        address: String
    },
    milestone: {type: ObjectId, ref: "Milestone"},
    sharing: String
});



module.exports = momentSchema;
