import AWS = require('aws-sdk');
import {config} from './config/config';

// Configure AWS
export const credentials = new AWS.SharedIniFileCredentials({profile: config.aws_profile});
AWS.config.credentials = credentials;

export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: config.aws_region,
  credentials: credentials,
  params: {Bucket: config.aws_media_bucket},
});

// Generates an AWS signed URL for retrieving objects
export function getGetSignedUrl( key: string ): Promise<string> {
  const signedUrlExpireSeconds = 60 * 5;
  const url = s3.getSignedUrl('getObject', {
    Bucket: config.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
  return Promise.resolve(url);
}

// Generates an AWS signed URL for uploading objects
export function getPutSignedUrl( key: string ): Promise<string> {
  const signedUrlExpireSeconds = 60 * 5;

  const url = s3.getSignedUrl('putObject', {
    Bucket: config.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
  return Promise.resolve(url);
}
