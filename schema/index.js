var user = require("./user");
var memory = require('./memory');
var milestone = require('./milestone');
var moment = require('./moment');
var album = require('./album');
var comment = require('./comment');

var schemas = {};

schemas.user = user;
schemas.memory = memory;
schemas.milestone = milestone;
schemas.moment = moment;
schemas.album = album;
schemas.comment = comment;


module.exports = schemas;
