var Memory = require("../model").Memory;
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
    function findUserIdByString(participant, cb) {
        //First determine if it is a username or an email
        if (participant.indexOf("@") > 0) {
            //We got an email, so let's search for the user by email
            findOrCreateUserIdByEmail(participant, cb);
        } else if (looksLikeObjectID(participant)) {
            findUserIdById(participant, function (err, value) {
                if (err || value) {
                    cb(err, value);
                } else {
                    findUserByUsername(participant, cb);
                }
            });
        } else {
            findUserIdByUsername(participant, cb);
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

    var createNewMemoryConfig = {
        handler: function(request, reply) {
            var initialPartcipants = [{
                acceptance: "accepted",
                role: "owner",
                user: request.auth.credentials._id
            }];
            var otherParticipants = request.payload.participants;
            async.map(otherParticipants, findUserIdByString, saveMemory);

            function saveMemory(err, verifiedParticipantIds) {
                if (err) {
                    return reply('Username could not be verified').code(422);
                }
                verifiedParticipantIds.forEach(function(userId) {
                    initialPartcipants.push({
                        acceptance: "unknown",
                        role: "member",
                        user: userId
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
                        reply('Database error').code(503);
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
