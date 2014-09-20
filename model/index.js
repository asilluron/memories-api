var mongoose = require('mongoose');
var schema = require("../schema");

var models = {};

var User = mongoose.model('User', schema.user);
var Memory = mongoose.model('Memory', schema.memory);
var Moment = mongoose.model('Moment', schema.moment);
var Milestone = mongoose.model('Milestone', schema.milestone);
//var Comment = mongoose.model('Comment', schema.comment);
//var Album = mongoose.model('Album', schema.album);

models.User = User;
models.Memory = Memory;
models.Moment = Moment;

module.exports = models;
