var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    creator: {type: ObjectId, ref: 'User'},
    text: String,
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedDate: {
        type: Date,
        default: Date.now
    }
});



module.exports = commentSchema;
