import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LocalDbStore } from './local-db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public isConnected = false;
  private localStore = new LocalDbStore();

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log('✅ Cơ sở dữ liệu PostgreSQL đã kết nối thành công (Port 5432)');
    } catch (err: any) {
      this.isConnected = false;
      console.warn('⚠️  PostgreSQL chưa bật hoặc chưa cài đặt (Port 5432).');
      console.warn('⚡ Backend tự động chuyển sang chế độ Local Database (lưu tại local_db.json).');
      console.warn('   Mọi API (Screens, Media, Layout, Player, Schedules) vẫn hoạt động 100%!');
      this.setupLocalFallback();
    }
  }

  private setupLocalFallback() {
    // Override model delegates with LocalDbStore handlers
    (this as any).user = this.localStore.createCollectionHandler('users');
    (this as any).screen = this.localStore.createCollectionHandler('screens');
    (this as any).mediaItem = this.localStore.createCollectionHandler('mediaItems');
    (this as any).layoutTemplate = this.localStore.createCollectionHandler('layoutTemplates');
    (this as any).schedule = this.localStore.createCollectionHandler('schedules');
    (this as any).proofOfPlayLog = this.localStore.createCollectionHandler('proofOfPlayLogs');
    (this as any).refreshToken = this.localStore.createCollectionHandler('refreshTokens');
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.$disconnect();
      } catch {}
    }
  }
}
