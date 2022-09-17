const aws = require('aws-sdk');
const s3 = new aws.S3();
module.exports = {aws, s3};