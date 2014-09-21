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
        },
        auth: "jwt"
    };

    var addMomentConfig = {
        handler: function(request, reply) {
            var newMoment = new Moment({
                memory: request.params.memid,
                creator: request.auth.credentials._id,
                text: request.payload.text,
                imageUrl: request.payload.imageUrl,
                location: request.payload.location,
                sharing: request.payload.sharing,
                milestone: request.payload.milestone
            });

            newMoment.save(function(err, moment) {
                if (err) {
                    reply({
                        name: 'Database error',
                        code: 503
                    });
                } else {
                    if(request.payload.milestone){
                        server.emit("MILESTONE:NEW_MOMENT", request.params.memid, milestone._id, moment._id);
                    }
                    else {
                        server.emit("MEMORY:NEW_MOMENT", request.params.memid, moment._id);
                    }
                    reply(moment);
                }
            });
        },
        auth: "jwt",
        validate: {
            payload: {
                memory: Joi.string(),
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
                milestone: Joi.string().min(24).max(24),
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
        },
        auth: "jwt"
    };


    var deleteMomentConfig = {
        handler: function(request, reply){
            Moment.findOneAndRemove({memory: request.params.memid, _id: request.params.id}, function(err){
                if(err){
                  reply({
                        name: 'Database error',
                        code: 503
                    });
              }
              else{
                server.emit("MEMORY:DELETE_MOMENT", request.params.memid, request.params.id);
                reply({deleted: true});
              }
            });
        },
        auth: "jwt"
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
