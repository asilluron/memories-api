var userRoutes = require("./user");
var loginRoutes = require("./login");
var memoryRoutes = require("./memory");
var momentFileSigRoute = require("./momentfilesig");

module.exports = [].concat(userRoutes, loginRoutes, memoryRoutes, momentFileSigRoute);
