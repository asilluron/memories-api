var userRoutes = require("./user");
var loginRoutes = require("./login");

module.exports = [].concat(userRoutes, loginRoutes);
