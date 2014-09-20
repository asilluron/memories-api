var Moment = require("../model").Moment;
var Joi = require("joi");
var Bcrypt = require('bcrypt');
var routes = [];



function momentApi(server) {

    var getAllMomentsConfig = {
        handler: function(request, reply){
            Moment.find({memory: request.params.memid}, function(err, moments){
                if(err){
                    reply({
                        name: 'Database error',
                        code: 503
                    });
                }
                else{
                    reply(moments);
                }
            });
        }
    };

    var addMomentConfig = {
        handler: function(request, reply) {
            var newMoment = new Moment({
                memory: request.params.memid,
                creator: request.auth.credentials._id,
                text: request.payload.text,
                imageUrl: request.payload.imageUrl,
                location: request.payload.location,
                sharing: request.payload.sharing
            });

            newMoment.save(function(err, moment) {
                if (err) {
                    reply({
                        name: 'Database error',
                        code: 503
                    });
                } else {
                    reply(moment);
                }
            });
        },
        auth: "jwt",
        validate: {
            payload: {
                text: Joi.string().min(0).max(1000),
                imageUrl: Joi.string().min(5).max(240),
                location: Joi.object({
                    name: Joi.string(),
                    gps: Joi.object({
                        lat: Joi.string(),
                        long: Joi.string()
                    }),
                    address: Joi.string()
                }),
                sharing: Joi.string().valid("private", "public").required()
            }
        }
    };

    var getMomentConfig = {
        handler: function(request, reply){
            Moment.findOne({memory: request.params.memid, _id: request.params.id}, function(err, moment){
                if(err){
                    reply({
                        name: 'Database error',
                        code: 503
                    });
                }
                else{
                    reply(moment);
                }
            });
        }
    };


    var deleteMomentConfig = {
        handler: function(request, reply){

        }
    };

    /**
     * ROUTES SETUP
     */
    routes.push({
        method: 'GET',
        path: '/memories/{memid}/moments',
        config: getAllMomentsConfig
    });

    routes.push({
        method: 'GET',
        path: '/memories/{memid}/moments/{id}',
        config: getMomentConfig
    });

    routes.push({
        method: 'POST',
        path: '/memories/{memid}/moments',
        config: addMomentConfig
    });

    routes.push({
        method: 'DELETE',
        path: '/memories/{memid}/moments/{id}',
        config: deleteMomentConfig
    });

    return routes;
}

module.exports = momentApi;
