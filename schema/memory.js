var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var memorySchema = new Schema({
    about: {
        name: String,
        primaryMoment: {type: ObjectId, ref: 'Moment'}
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedDate: {
        type: Date,
        default: Date.now
    },
    startDate: Date,
    preferences: {
        sharing: String
    },
    endDate: Date,
    active: {type: Boolean, index: true},
    participants: [{acceptance: String, role: String, user: {type: ObjectId, ref: 'User'}}]
});



module.exports = memorySchema;
