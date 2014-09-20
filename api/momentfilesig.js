var crypto = require("crypto");
var config = require("../config");
var AWS = require("aws-sdk");



function fileSigApi(server) {

    var fileSigRoutes = [];
    AWS.config.update(config.aws);
    fileSigRoutes.push({
        method: 'GET',
        path: '/momentfilesig',
        config: {
            auth: 'jwt',
            handler: function(request, reply) {
                var objName = request.query.s3_object_name;

                var mimeType = request.query.s3_object_type;

                var s3 = new AWS.S3();
                var params = {
                    ContentType: mimeType,
                    Bucket: process.env.S3_BUCKET,
                    Key: objName,
                    ACL: "public-read"
                };
                var signedUrl = s3.getSignedUrl('putObject', params);
                var publicUrl = 'https://' + process.env.S3_BUCKET + '.s3.amazonaws.com/' + objName;
                var credentials = {
                    publicUrl: publicUrl,
                    signedUrl: signedUrl
                };

                reply(credentials);
            }
        }
    });

    return fileSigRoutes;
}

module.exports = fileSigApi;
