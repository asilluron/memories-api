var Memory = require("../model").Memory;
var User = require("../model").User;
var Joi = require("joi");
var async = require("async");
var routes = [];
var verifiedParticipants = [];

function memoryApi(server) {
    // TODO: lock down memory access to participants

    function populateVerifiedUsers(participant, cb) {
        //First determine if it is a username or an email
        if (participant.indexOf("@") > 0) {
            //We got an email, so let's search for the user by email
            User.findOne({
                email: participant
            }).exec(function(err, user) {
                if (typeof user === "object") {
                    verifiedParticipants.push(user._id);
                    cb();
                } else {
                    //Create a new user
                    var newUser = new User({
                        email: participant
                    }).save(function(err, user) {
                        verifiedParticipants.push(user._id);
                        cb();
                    });
                }
            });
        } else {
            User.find({
                username: participant
            }).exec(function(err, user) {
                if (user) {
                    verifiedParticipants.push(user._id);
                    cb();
                } else {
                    cb("Username could not be verified");
                }
            });
        }
    }
    //Update a memory
    var updateMemoryConfig = {
        handler: function(request, reply) {
            var memid = request.params.id;
            Memory.findOneAndUpdate({
                "_id": memid
            }, request.payload, {}, function(err, memory) {
                console.log(err);
                reply(memory);
            });
        },
        auth: "jwt"
    };

    //Delete a memory by ID

    //Get a memory
    var getAllMemoryConfig = {
        handler: function(request, reply) {
            Memory.find({
                "participants.user": request.auth.credentials._id
            })
                .populate('participants.user')
                .exec(function(err, memory) {
                    reply(memory);
                });

        },
        auth: "jwt"
    };

    var getMemoryConfig = {
        handler: function(request, reply) {
            Memory.findOne({
                "_id": request.params.id
            })
                .populate('participants.user')
                .exec(function(err, memory) {
                    reply(memory);
                });

        },
        auth: "jwt"
    };

    //Delete a memory
    var deleteMemoryConfig = {
        handler: function(request, reply) {
            Memory.findOneAndRemove({
                "id": request.params.id
            }, function(err) {
                if (err) {
                    reply({
                        name: 'Database error',
                        code: 503
                    });
                } else {
                    reply({
                        "deleted": true
                    });
                }
            });

        },
        auth: "jwt",
        validate: {
            params: {
                id: Joi.string().min(1).max(60).required()
            }
        }
    };

    var createNewMemoryConfig = {
        handler: function(request, reply) {
            var initialPartcipants = [{
                acceptance: "accepted",
                role: "owner",
                user: request.auth.credentials._id
            }];
            var otherParticipants = request.payload.participants;
            async.each(otherParticipants, populateVerifiedUsers, saveMemory);

            function saveMemory(err) {
                if (err) {
                    reply({
                        name: 'Username could not be verified',
                        code: 422
                    });
                }
                verifiedParticipants.forEach(function(vparticipant) {
                    initialPartcipants.push({
                        acceptance: "unknown",
                        role: "member",
                        user: vparticipant
                    });
                });

                var newMemory = new Memory({
                    "about.name": request.payload.about.name,
                    participants: initialPartcipants,
                    "preferences.sharing": request.payload.preferences.sharing,
                    startDate: request.payload.startDate,
                    endDate: request.payload.endDate
                });

                if (request.payload.startDate) {

                }

                newMemory.save(function(err, memory) {
                    if (err) {
                        reply({
                            name: 'Database error',
                            code: 503
                        });
                    } else {
                        server.emit('MEMORY:NEW', memory._id);
                        reply(newMemory);
                    }
                });
            }



        },
        auth: "jwt",
        validate: {
            payload: {
                about: Joi.object({
                    name: Joi.string().min(1).max(200).required()
                }).required(),
                participants: Joi.array(),
                startDate: Joi.date(),
                endDate: Joi.date(),
                preferences: Joi.object({
                    sharing: Joi.string().valid('public', 'private', 'unlisted').required()
                }).required()
            }
        }
    };


    /**
     * ROUTES SETUP
     */
    routes.push({
        method: 'GET',
        path: '/memories',
        config: getAllMemoryConfig
    });

    routes.push({
        method: 'POST',
        path: '/memories',
        config: createNewMemoryConfig
    });

    routes.push({
        method: 'GET',
        path: '/memories/{id}',
        config: getMemoryConfig
    });

    routes.push({
        method: 'PATCH',
        path: '/memories/{id}',
        config: updateMemoryConfig
    });

    routes.push({
        method: 'DELETE',
        path: '/memories/{id}',
        config: deleteMemoryConfig
    });

    return routes;

}

module.exports = memoryApi;
