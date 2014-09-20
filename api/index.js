var userRoutes = require("./user");
var loginRoutes = require("./login");
var memoryRoutes = require("./memory");

module.exports = [].concat(userRoutes, loginRoutes, memoryRoutes);
