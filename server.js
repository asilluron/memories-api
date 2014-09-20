var mongoose = require('mongoose');
var Hapi = require('hapi');
var lout = require("lout");
var config = require("./config");
var model = require("./model");

mongoose.connect(config.mongoconnection);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {});


var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8700;

var options = {
    cors: {
        origin: ["http://localhost:*"],
        headers: ["Authorization", "Content-Type"]
    }
};


var server = new Hapi.Server(port, options);

var validateLogin = function(username, password, callback) {
    var criteria;
    //Allow login through email or username... handy
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
        if (username) {
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
            return cb(null, false, user._id);
        }
        cb(null, true, user);
    });
};


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
        key: process.env.JWT_KEY,
        validateFunc: validateToken
    });

    server.start(function() {
        console.log("Hapi server started @ " + server.info.uri);
    });

});
