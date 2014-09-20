var mongoose = require('mongoose');
var schema = require("../schema");

var models = {};

var User = mongoose.model('User', schema.user);

models.User = User;

module.exports = models;
