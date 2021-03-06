var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var milestoneSchema = new Schema({
    memory: {
        type: ObjectId,
        ref: 'Memory'
    },
    creator: {
        type: ObjectId,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedDate: {
        type: Date,
        default: Date.now
    },
    participation: String, //invite anyone
    participants: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        arrival: Date,
        departure: Date
    }],
    about: {
        startDate: Date,
        endDate: Date,
        desc: String,
        primaryMoment: {
            type: ObjectId,
            ref: 'Moment'
        }
    },
    viewability: String, //public, participant
});



module.exports = milestoneSchema;
