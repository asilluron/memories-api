var Moment = require("../model").Moment;
var Joi = require("joi");
var Bcrypt = require('bcrypt');
var routes = [];



function momentApi(server) {

    /**
     * ROUTES SETUP
     */
    routes.push({
        method: 'GET',
        path: '/moment',
        config: getMomentConfig
    });

    routes.push({
        method: 'POST',
        path: '/user',
        config: addMomentConfig
    });

    return routes;
}

module.exports = momentApi;
