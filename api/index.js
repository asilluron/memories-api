var userApi = require("./user");
var loginApi = require("./login");
var memoryApi = require("./memory");
var fileSigApi = require("./momentfilesig");
var momentApi = require("./moment");
var milestoneApi = require("./milestones");

function Api(server) {
    var routes = [].concat(milestoneApi(server), userApi(server), memoryApi(server), loginApi(server), momentApi(server),fileSigApi(server));
    return routes;
}

module.exports = Api;
