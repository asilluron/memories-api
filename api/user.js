var User = require("../model").User;
var Joi = require("joi");
var Bcrypt = require('bcrypt');
var routes = [];

function userApi(server) {
    //Get a user
    var getUserConfig = {
        handler: function(request, reply) {
            User.findOne({
                _id: request.auth.credentials._id
            })
                .exec(function(err, user) {
                    reply(user);
                });

        },
        auth: "jwt"
    };


    //Add a new user
    var addUserConfig = {
        handler: function(request, reply) {
            var salt1 = Bcrypt.genSaltSync(8);
            var newUser = new User({
                email: request.payload.email,
                password: Bcrypt.hashSync(request.payload.password, salt1),
                preferredName: request.payload.name
            });

            console.log(request.payload);

            newUser.save(function(err, user) {
                if (err) {
                    reply({
                        saved: false
                    });
                } else {
                    reply({
                        saved: true
                    });
                }
            });
        }
    };


    /**
     * ROUTES SETUP
     */
    routes.push({
        method: 'GET',
        path: '/user',
        config: getUserConfig
    });

    routes.push({
        method: 'POST',
        path: '/user',
        config: addUserConfig
    });

    return routes;
}

module.exports = userApi;
