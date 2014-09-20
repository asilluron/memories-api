var config = {};
config.privatekey=process.env.JWT_KEY;
config.aws = {};
config.aws.accessKeyId = process.env.AWS_ACCESS_KEY;
config.aws.secretAccessKey = process.env.AWS_SECRET_KEY;
config.aws.region = process.env.AWS_REGION;

config.mongoconnection = 'mongodb://' + process.env.MONGOLABS_USER + ':' + process.env.MONGOLABS_PASS + '@' + process.env.MONGOLABS_URL + ':' + process.env.MONGOLABS_PORT + '/' + process.env.MONGOLABS_DB;

module.exports = config;
