var Memory = require("../model").Memory;
var Moment = require("../model").Moment;
var User = require("../model").User;
var Joi = require("joi");
var async = require("async");

function memoryApi(server) {
    // TODO: lock down memory access to participants

    var objectIDRegex = /^[0-9a-fA-F]{24}$/;
    function looksLikeObjectID(string) {
        return objectIDRegex.test(string);
    }
    function findOrCreateUserIdByEmail(email, cb) {
        User.findOne({
            email: email
        }).exec(function(err, user) {
            if (err) {
                cb(err);
            } else if (user != null) {
                cb(null, user._id);
            } else {
                //Create a new user
                new User({
                    email: email
                }).save(function(err, user) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, user._id);
                    }
                });
            }
        });
    }
    function findUserIdById(id, cb) {
        User.findOne({
            _id: id
        }).exec(function(err, user) {
            if (err) {
                cb(err);
            } else {
                cb(null, user && user._id);
            }
        });
    }
    function findUserIdByUsername(username, cb) {
        User.findOne({
            username: username
        }).exec(function(err, user) {
            if (err) {
                cb(err);
            } else if (user) {
                cb(null, user._id);
            } else {
                cb(new Error("User not found: " + username));
            }
        });
    }
    function findUserIdByToken(token, cb) {
        //First determine if it is a username or an email
        if (token.indexOf("@") > 0) {
            //We got an email, so let's search for the user by email
            findOrCreateUserIdByEmail(token, cb);
        } else if (looksLikeObjectID(token)) {
            findUserIdById(token, function (err, value) {
                if (err || value) {
                    cb(err, value);
                } else {
                    findUserByUsername(token, cb);
                }
            });
        } else {
            findUserIdByUsername(token, cb);
        }
    }
    //Update a memory
    var updateMemoryConfig = {
        handler: function(request, reply) {
            // TODO: only allow owner to update
            var id = request.params.id;

            async.map(request.payload.participants, normalizeParticipant, saveMemory);

            function saveMemory(err, participants) {
                if (err) {
                    return reply('Username could not be verified').code(422);
                }

                Memory.findOneAndUpdate({
                    "_id": id
                }, {
                    "about.name": request.payload.about.name,
                    participants: participants,
                    "preferences.sharing": request.payload.preferences.sharing,
                    startDate: request.payload.startDate,
                    endDate: request.payload.endDate,
                    modifiedDate: new Date()
                }, function(err, memory) {
                    if (err) {
                        console.log(err);
                        reply('Database error').code(503);
                    } else {
                        server.emit('MEMORY:EDIT', id);
                        reply().code(204);
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
                participants: Joi.array().includes(
                    Joi.object({
                        user: Joi.string().min(1).required(),
                        role: Joi.string().valid('member', 'moderator', 'owner').required()
                    })).required(),
                startDate: Joi.date().allow(null),
                endDate: Joi.date().allow(null),
                preferences: Joi.object({
                    sharing: Joi.string().valid('public', 'private', 'unlisted').required()
                }).required()
            }
        }
    };

    //Delete a memory by ID

    //Get a memory
    var getAllMemoryConfig = {
        handler: function(request, reply) {
            Memory.find({
                "participants.user": request.auth.credentials._id
            })
                .populate('about.primaryMoment')
                .populate('participants.user')
                .exec(function(err, memories) {
                    if (err) {
                        reply('Database error').code(503);
                    } else {
                        reply(memories);
                    }
                });

        },
        auth: "jwt"
    };

    var getMemoryConfig = {
        handler: function(request, reply) {
            Memory.findOne({
                "_id": request.params.id
            })
                .populate('about.primaryMoment')
                .populate('participants.user')
                .exec(function(err, memory) {
                    if (err) {
                        reply('Database error').code(503);
                    } else if (!memory) {
                        reply('Memory not found').code(404);
                    } else {
                        reply(memory);
                    }
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
                    reply('Database error').code(503);
                } else {
                    reply().code(204);
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

    function normalizeParticipant(participant, cb) {
        findUserIdByToken(participant.user, function (err, userId) {
            if (err) {
                cb(err);
            } else {
                cb(null, {
                    acceptance: 'unknown',
                    role: participant.role,
                    user: userId
                });
            }
        });
    }
    var createNewMemoryConfig = {
        handler: function(request, reply) {
            var payloadMoment = request.payload.about.primaryMoment;
            
            var ownerParticipant = {
                acceptance: "accepted",
                role: "owner",
                user: request.auth.credentials._id
            };
            async.map(request.payload.participants, normalizeParticipant, saveMemory);

            function saveMemory(err, otherParticipants) {
                if (err) {
                    return reply('Username could not be verified').code(422);
                }

                var newMemory = new Memory({
                    "about.name": request.payload.about.name,
                    participants: [ownerParticipant].concat(otherParticipants),
                    "preferences.sharing": request.payload.preferences.sharing,
                    startDate: request.payload.startDate,
                    endDate: request.payload.endDate
                });

                console.log(request.payload);

                newMemory.save(function(err, memory) {
                    if (err) {
                        reply('Database error').code(503);
                    } else {
                        var next = function () {
                            server.emit('MEMORY:NEW', memory._id);
                            reply({
                                _id: memory._id
                            }).code(201);
                        };
                        if (payloadMoment) {
                            new Moment({
                                memory: memory._id,
                                creator: request.auth.credentials._id,
                                text: payloadMoment.text,
                                imageUrl: payloadMoment.imageUrl,
                                location: payloadMoment.location,
                                sharing: payloadMoment.sharing,
                                milestone: null
                            }).save(function (err, moment) {
                                if (err) {
                                    reply('Database error').code(503);
                                } else {
                                    Memory.findOneAndUpdate({
                                        _id: memory._id
                                    }, {
                                        'about.primaryMoment': moment._id
                                    }, function (err) {
                                        if (err) {
                                            reply('Database error').code(503);
                                        } else {
                                            next();
                                        }
                                    });
                                }
                            });
                        } else {
                            next();
                        }
                    }
                });
            }
        },
        auth: "jwt",
        validate: {
            payload: {
                about: Joi.object({
                    name: Joi.string().min(1).max(200).required(),
                    primaryMoment: Joi.object({
                        text: Joi.string().min(0).max(1000).allow(''),
                        imageUrl: Joi.string().min(5).max(240),
                        location: Joi.object({
                            name: Joi.string().min(0).max(200).allow(''),
                            gps: Joi.object({
                                lat: Joi.string().min(0).max(200).allow(''),
                                long: Joi.string().min(0).max(200).allow('')
                            }).allow(null),
                            address: Joi.string().min(0).max(200).allow('')
                        }),
                        sharing: Joi.string().valid("private", "public").required()
                    }).allow(null),
                }).required(),
                participants: Joi.array().includes(
                    Joi.object({
                        user: Joi.string().min(1).required(),
                        role: Joi.string().valid('member', 'moderator').required()
                    })).required(),
                startDate: Joi.date().allow(null),
                endDate: Joi.date().allow(null),
                preferences: Joi.object({
                    sharing: Joi.string().valid('public', 'private', 'unlisted').required()
                }).required()
            }
        }
    };


    /**
     * ROUTES SETUP
     */
    var routes = [];
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
