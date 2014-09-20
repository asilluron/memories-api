var mongoose = require('mongoose');
var Hapi = require('hapi');
var lout = require("lout");
var config = require("./config");

mongoose.connect(config.mongoconnection);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
});


var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8700;

var options = {
    cors: {
        origin: ["http://localhost:*"],
        headers: ["Authorization", "Content-Type"]
    }
};


var server = new Hapi.Server(port, options);


server.pack.register([], function(err) {
    if (err) {
        throw err;
    }

    server.start(function() {
        console.log("Hapi server started @ " + server.info.uri);
    });

});
