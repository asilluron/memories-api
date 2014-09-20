var userApi = require("./user");
var loginApi = require("./login");
var memoryApi = require("./memory");
var fileSigApi = require("./momentfilesig");

function Api(server) {
    var routes = [].concat(userApi(server), memoryApi(server), loginApi(server), fileSigApi(server));
    return routes;
}

module.exports = Api;
