
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { Readable } from "stream";
import { config } from "../config.js";

const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

export const s3Service = {
  /**
   * Upload a file from the filesystem to S3
   */
  async uploadFile(key: string, filePath: string, contentType?: string) {
    const fileStream = fs.createReadStream(filePath);
    return this.uploadStream(key, fileStream, contentType);
  },

  /**
   * Upload a logical JSON object to S3
   */
  async uploadJson(key: string, data: any) {
    const jsonString = JSON.stringify(data, null, 2);
    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: jsonString,
      ContentType: "application/json",
    });
    return s3Client.send(command);
  },

  /**
   * Stream data to S3 using multipart upload manager
   */
  async uploadStream(key: string, stream: Readable | Buffer | string, contentType?: string) {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: config.s3.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
    });

    return upload.done();
  },

  /**
   * Generate a presigned URL for downloading an object
   */
  async getPresignedUrl(key: string, expiresIn = 900) {
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  },

  /**
   * Get metadata for an object (e.g. size)
   */
  async headObject(key: string) {
    const command = new HeadObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    });
    return s3Client.send(command);
  },

  /**
   * Helper to generate standard key paths
   */
  getKeys(userId: string, generationId: string) {
    const base = `tenants/${userId}/generations/${generationId}`;
    return {
      zipKey: `${base}/artifact.zip`,
      specKey: `${base}/designspec.json`
    };
  }
};
