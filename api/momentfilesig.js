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
                var username = request.auth.credentials.username || request.auth.credentials.email;
                var objName = request.query.s3_object_name;
                var pubObjName = objName;
                var msum = crypto.createHash('sha1');
                msum.update(request.auth.credentials._id + "");
                var prefix = msum.digest("hex");
                objName = username + "/" + prefix + "_" + objName;
                pubObjName = encodeURIComponent(encodeURIComponent(username)) + "/" + prefix + "_" + pubObjName;
                var mimeType = request.query.s3_object_type;

                var s3 = new AWS.S3();
                var params = {
                    ContentType: mimeType,
                    Bucket: process.env.S3_BUCKET,
                    Key: objName,
                    ACL: "public-read"
                };
                var signedUrl = s3.getSignedUrl('putObject', params);
                var publicUrl = 'https://' + 's3-' +process.env.AWS_REGION +'.amazonaws.com/' + process.env.S3_BUCKET + "/" + objName;
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
