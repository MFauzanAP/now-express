const aws = require('aws-sdk');
const s3 = new aws.S3();
s3.putObject({
	Key: 'data.json',
	Bucket: process.env.AWS_BUCKET,
	Body: JSON.stringify({users:{}}),
  }).promise();
  s3.putObject({
	Key: 'keys.json',
	Bucket: process.env.AWS_BUCKET,
	Body: JSON.stringify({}),
  }).promise();
module.exports = {aws, s3};