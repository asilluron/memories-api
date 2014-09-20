var Memory = require("../model").Memory;
var User = require("../model").User;
var Joi = require("joi");
var async = require("async");
var routes = [];


//Get a user
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

var createNewMemoryConfig = {
    handler: function(request, reply) {
        var initialPartcipants = [{
            acceptance: "accepted",
            role: "owner",
            user: request.auth.credentials._id
        }];
        var otherParticipants = request.payload.participants;
        var verifiedParticipants = [];
        async.each(otherParticipants, function(participant, cb) {
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
        }, saveMemory);


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
                about: {
                    name: request.payload.name
                },
                participants: initialPartcipants
            });

            newMemory.save(function(err, memory) {
                if (err) {
                    reply({
                        saved: false
                    });
                } else {
                    reply(memory._id);
                }
            });
        }



    },
    auth: "jwt"
};


/**
 * ROUTES SETUP
 */
routes.push({
    method: 'GET',
    path: '/memory',
    config: getAllMemoryConfig
});

routes.push({
    method: 'POST',
    path: '/memory',
    config: createNewMemoryConfig
});


module.exports = routes;
