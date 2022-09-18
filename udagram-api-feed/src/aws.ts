import AWS = require('aws-sdk');
import {config} from './config/config';

// Configure AWS
export const credentials = new AWS.SharedIniFileCredentials({profile: config.aws_profile});
AWS.config.credentials = credentials;

export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: config.aws_region,
  credentials: credentials,
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key,
  params: {Bucket: config.aws_media_bucket},
});

// Generates an AWS signed URL for retrieving objects
export function getGetSignedUrl( key: string ): string {
  const signedUrlExpireSeconds = 60 * 5;

  return s3.getSignedUrl('getObject', {
    Bucket: config.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
}

// Generates an AWS signed URL for uploading objects
export function getPutSignedUrl( key: string ): string {
  const signedUrlExpireSeconds = 60 * 5;

  return s3.getSignedUrl('putObject', {
    Bucket: config.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
}

export function getGetSignedUrlPromise(key: string): Promise<string> {
  const signedUrlExpireSeconds = 60 * 5;

  return s3.getSignedUrlPromise('getObject', {
    Bucket: config.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
}

export function getPutSignedUrlPromise(key: string): Promise<string> {
  const signedUrlExpireSeconds = 60 * 5;

  return s3.getSignedUrlPromise('putObject', {
    Bucket: config.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
}
