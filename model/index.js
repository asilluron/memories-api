var mongoose = require('mongoose');
var schema = require("../schema");

var models = {};

var User = mongoose.model('User', schema.user);
var Memory = mongoose.model('Memory', schema.memory);

models.User = User;
models.Memory = Memory;

module.exports = models;
