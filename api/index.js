var userApi = require("./user");
var loginApi = require("./login");
var memoryApi = require("./memory");
var fileSigApi = require("./momentfilesig");
var momentApi = require("./moment");

function Api(server) {
    var routes = [].concat(userApi(server), memoryApi(server), loginApi(server), momentApi(server),fileSigApi(server));
    return routes;
}

module.exports = Api;
