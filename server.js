var mongoose = require('mongoose');
var Hapi = require('hapi');
var lout = require("lout");
var config = require("./config");
var model = require("./model");
var Bcrypt = require('bcrypt');
var io = require('socket.io');
var redis = require('redis');

var redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL, {});
redisClient.auth(process.env.REDIS_PASS);

mongoose.connect(config.mongoconnection);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {});

var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8700;

var options = {
    cors: {
        origin: ["http://localhost:*", "http://m.emori.es"],
        headers: ["Authorization", "Content-Type", "Access-Control-Allow-Credentials"]
    }
};


var validateLogin = function(username, password, callback) {
    var criteria;
    if (username.indexOf('@') > 0) {
        criteria = {
            email: username
        };
    } else {
        criteria = {
            username: username
        };
    }
    model.User.findOne(criteria).exec(function(err, user) {
        if (err) {
            callback(err);
        } else if (user) {
            Bcrypt.compare(password, user.password, function(err, isValid) {
                callback(err, isValid, user);
            });
        } else {
            return callback(null, false);
        }
    });

};


var validateToken = function(token, decodedToken, cb) {
    model.User.findById(decodedToken.id).exec(function(err, user) {
        if (err) {
            return cb(null, false, user && user._id);
        }
        cb(null, true, user);
    });
};

var internals = {};


internals.startServer = function() {

    var server = new Hapi.Server(port, options);



    server.start(function() {
        var socketHandler = require("./socketService")(server);

        server.on('MEMORY:JOIN', function(data){
            socketHandler.memoryHandler(data._id);
        });

        server.on('MEMORY:NEW_MILESTONE', function(memoryId, milestoneid) {
            var memSocketHandler = socketHandler.memoryHandler(memoryId);
            memSocketHandler.newMilestone(milestoneid);
        });

        server.on('MEMORY:DELETE_MILESTONE', function(memoryId, milestoneid) {
            var memSocketHandler = socketHandler.memoryHandler(memoryId);
            memSocketHandler.deleteMilestone(milestoneid);
        });

        //A new moment is created on a memory, not associate with a milestone
        server.on('MEMORY:NEW_MOMENT', function(memoryId, momentId) {
            var memSocketHandler = socketHandler.memoryHandler(memoryId);
            memSocketHandler.newMoment(momentId);
        });

         server.on('MEMORY:DELETE_MOMENT', function(memoryId, momentId) {
            var memSocketHandler = socketHandler.memoryHandler(memoryId);
            memSocketHandler.deleteMoment(momentId);
        });

        server.on('MILESTONE:NEW_MOMENT', function(memoryId, milestoneid, momentId) {
            var milestoneSocketHandler = socketHandler.milestoneHandler(memoryId, milestoneid);
            milestoneSocketHandler.newMoment(momentId);
        });
    });

    var api = new require("./api")(server);

    server.pack.register([{
        plugin: lout
    }, {
        plugin: require('hapi-auth-jsonwebtoken')
    }, {
        plugin: require('hapi-auth-basic')
    }], function(err) {
        if (err) {
            throw err;
        }

        server.auth.strategy('simple', 'basic', {
            validateFunc: validateLogin
        });

        server.auth.strategy('jwt', 'jwt', {
            key: config.privatekey,
            validateFunc: validateToken
        });

        server.start(function() {
            console.log("Hapi server started @ " + server.info.uri);
        });


        api.forEach(function(route) {
            server.route(route);
        });
    });
};


internals.startServer();
