import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private minioClient: Minio.Client | null = null;
  private bucket: string;
  private isMinioAvailable = false;
  private localUploadDir: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get('MINIO_BUCKET_NAME', 'led-cms-media');
    this.localUploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }

    try {
      this.minioClient = new Minio.Client({
        endPoint: config.get('MINIO_ENDPOINT', 'localhost'),
        port: parseInt(config.get('MINIO_PORT', '9000')),
        useSSL: config.get('MINIO_USE_SSL') === 'true',
        accessKey: config.get('MINIO_ACCESS_KEY', 'led_minio_admin'),
        secretKey: config.get('MINIO_SECRET_KEY', 'Led@Minio2026'),
      });

      // An toàn: bọc catch để không làm sập ứng dụng nếu MinIO chưa bật
      this.ensureBucket().catch((err) => {
        console.warn('ℹ️  MinIO (S3) chưa kích hoạt. Hệ thống tự động chuyển sang Local Disk Storage:', err.message);
        this.isMinioAvailable = false;
      });
    } catch (err: any) {
      console.warn('ℹ️  Không thể khởi tạo MinIO client. Dùng Local Storage:', err.message);
      this.isMinioAvailable = false;
    }
  }

  private async ensureBucket() {
    if (!this.minioClient) return;
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket, 'us-east-1');
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
    this.isMinioAvailable = true;
    console.log(`✅ MinIO Object Storage đã kết nối`);
  }

  async uploadToMinio(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;

    if (this.isMinioAvailable && this.minioClient) {
      try {
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
      } catch (err: any) {
        console.warn('⚠️ Upload MinIO thất bại, chuyển sang lưu Local Disk:', err.message);
      }
    }

    // Local Disk Fallback
    const localFilePath = path.join(this.localUploadDir, fileName);
    await fs.promises.writeFile(localFilePath, file.buffer);
    const port = this.config.get('PORT', '5000');
    const url = `http://localhost:${port}/uploads/${fileName}`;
    return { url, path: `uploads/${fileName}` };
  }

  async deleteFromMinio(objectPath: string) {
    if (this.isMinioAvailable && this.minioClient) {
      try {
        await this.minioClient.removeObject(this.bucket, objectPath);
        return;
      } catch {}
    }
    try {
      const fileName = path.basename(objectPath);
      const localFilePath = path.join(this.localUploadDir, fileName);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
      }
    } catch {}
  }
}
