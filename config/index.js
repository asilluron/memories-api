var config = {};

config.mongoconnection = 'mongodb://' + process.env.MONGOLABS_USER + ':' + process.env.MONGOLABS_PASS + '@' + process.env.MONGOLABS_URL + ':' + process.env.MONGOLABS_PORT + '/' + process.env.MONGOLABS_DB;

module.exports = config;
