var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var albumSchema = new Schema({
    name: String,
    memory: {type: ObjectId, ref: "Memory"},
    creator: {type: ObjectId, ref: "User"},
    milestones: [{type: ObjectId, ref: "Milestone"}],
    shareability: String,
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedDate: {
        type: Date,
        default: Date.now
    },
    theme: {type: ObjectId, ref: "Theme"}
});



module.exports = albumSchema;
