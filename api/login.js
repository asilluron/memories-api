var jwt = require("jsonwebtoken");
var config = require("../config");

function loginApi(server) {
    var loginRoutes = [];
    loginRoutes.push({
        method: 'GET',
        path: '/login',
        config: {
            auth: 'simple'
        },
        handler: function(request, reply) {
            reply({
                token: jwt.sign({
                    id: request.auth.credentials._id
                }, config.privatekey)
            });
        }
    });

    return loginRoutes;
}

module.exports = loginApi;
