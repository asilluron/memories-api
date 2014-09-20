var loginRoutes = [];
var jwt = require("jsonwebtoken");
var config = require("../config");

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

module.exports = loginRoutes;
