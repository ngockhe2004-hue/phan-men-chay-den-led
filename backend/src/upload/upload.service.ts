import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadService {
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get('MINIO_BUCKET_NAME', 'led-cms-media');
    this.minioClient = new Minio.Client({
      endPoint: config.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(config.get('MINIO_PORT', '9000')),
      useSSL: config.get('MINIO_USE_SSL') === 'true',
      accessKey: config.get('MINIO_ACCESS_KEY', 'led_minio_admin'),
      secretKey: config.get('MINIO_SECRET_KEY', 'Led@Minio2026'),
    });
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket, 'us-east-1');
      // Make bucket public readable
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        }],
      });
      await this.minioClient.setBucketPolicy(this.bucket, policy);
      console.log(`✅ MinIO bucket "${this.bucket}" created with public-read policy`);
    }
  }

  async uploadToMinio(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const objectPath = `uploads/${fileName}`;

    await this.minioClient.putObject(
      this.bucket,
      objectPath,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const endpoint = this.config.get('MINIO_ENDPOINT', 'localhost');
    const port = this.config.get('MINIO_PORT', '9000');
    const url = `http://${endpoint}:${port}/${this.bucket}/${objectPath}`;

    return { url, path: objectPath };
  }

  async deleteFromMinio(objectPath: string) {
    await this.minioClient.removeObject(this.bucket, objectPath);
  }
}
