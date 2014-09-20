var Milestone = require("../model").Milestone;
var Moment = require("../model").Moment;
var Joi = require("joi");
var Bcrypt = require('bcrypt');
var routes = [];



function milestonesApi(server) {
    var addMilestoneConfig = {
        handler: function(request, reply) {
            //first create a moment
            var newMoment = new Moment({
                memory: request.params.memid,
                creator: request.auth.credentials._id,
                text: request.payload.moment.text,
                imageUrl: request.payload.moment.imageUrl,
                location: request.payload.moment.location,
                sharing: request.payload.moment.sharing
            });

            newMoment.save(function(err, moment) {
                if (err) {
                    reply("Could not create moment").code(503);
                }
                var newMilestone = new Milestone({
                    memory: request.params.memid,
                    creator: request.auth.credentials._id,
                    participation: request.payload.participation,
                    participants: request.payload.participants,
                    about: {
                        startDate: request.payload.about.startDate,
                        endDate: request.payload.about.endDate,
                        desc: request.payload.about.desc,
                        primaryMoment: moment._id
                    },
                    viewability: request.payload.viewability
                });

                newMilestone.save(function(err, milestone){
                    if(err){
                        reply("Could not create milestone").reply(503);
                    }
                    else{
                        reply(milestone);
                    }
                });

            });
        },
        auth: "jwt",
        validate: {
            payload: {
                moment: Joi.object({
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
                }),
                participation: Joi.string().valid("invite", "anyone"),
                participants: Joi.array().includes(Joi.object({
                    user: Joi.string().min(24).max(24),
                    arrival: Joi.date().allow(null),
                    departure: Joi.date().allow(null)
                })),
                about: Joi.object({
                    startDate: Joi.date().allow(null),
                    endDate: Joi.date().allow(null),
                    desc: Joi.string()
                }),
                viewability: Joi.string().valid('public', 'participant')
            }
        }

    };

    var getAllMilestonesConfig = {
        handler: function(request, reply) {

        }
    };

    var getMilestoneConfig = {
        handler: function(request, reply) {

        }
    };

    var deleteMilestoneConfig = {
        handler: function(request, reply) {

        }
    };


    /**
     * ROUTES SETUP
     */
    routes.push({
        method: 'GET',
        path: '/memories/{memid}/milestones',
        config: getAllMilestonesConfig
    });

    routes.push({
        method: 'GET',
        path: '/memories/{memid}/milestones/{id}',
        config: getMilestoneConfig
    });

    routes.push({
        method: 'POST',
        path: '/memories/{memid}/milestones',
        config: addMilestoneConfig
    });

    routes.push({
        method: 'DELETE',
        path: '/memories/{memid}/milestones/{id}',
        config: deleteMilestoneConfig
    });

    return routes;
}

module.exports = milestonesApi;
