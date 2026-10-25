import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu khởi tạo...');

  // 1. Tạo Users (Admin: admin / admin123)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ledcms.vn' },
    update: { password: adminPassword },
    create: {
      email: 'admin@ledcms.vn',
      name: 'Quản Trị Viên (Admin)',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@ledcms.vn' },
    update: {},
    create: {
      email: 'operator@ledcms.vn',
      name: 'Kỹ Thuật Viên LED',
      password: operatorPassword,
      role: Role.OPERATOR,
      isActive: true,
    },
  });

  console.log(`✅ Đã tạo user: ${admin.email} & ${operator.email}`);

  // 2. Tạo Màn Hình Mẫu (Screens)
  const screensData = [
    {
      code: 'SCR-P5-01',
      name: 'LED Khán Đài Chính (P5 outdoor)',
      resolutionWidth: 1920,
      resolutionHeight: 1080,
      orientation: 'landscape',
      location: 'Sân vận động / Mặt trước tòa nhà',
      group: 'Khu A',
      status: 'online',
      volume: 85,
    },
    {
      code: 'SCR-P3-02',
      name: 'LED Sảnh Đón Khách (P3 indoor)',
      resolutionWidth: 1920,
      resolutionHeight: 1080,
      orientation: 'landscape',
      location: 'Sảnh chính Tầng 1',
      group: 'Khu B',
      status: 'online',
      volume: 60,
    },
    {
      code: 'SCR-P2-03',
      name: 'LED Phòng Họp VIP (P2 indoor)',
      resolutionWidth: 3840,
      resolutionHeight: 2160,
      orientation: 'landscape',
      location: 'Phòng họp Hội nghị Tầng 3',
      group: 'Khu C',
      status: 'online',
      volume: 70,
    },
    {
      code: 'SCR-KSK-04',
      name: 'Kiosk Đứng Thông Tin (Kiosk 55")',
      resolutionWidth: 1080,
      resolutionHeight: 1920,
      orientation: 'portrait',
      location: 'Cửa ra vào thang máy Tầng 1',
      group: 'Khu B',
      status: 'offline',
      volume: 50,
    },
  ];

  for (const s of screensData) {
    await prisma.screen.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }
  console.log(`✅ Đã tạo ${screensData.length} màn hình LED mẫu.`);

  // 3. Tạo Giao Diện Mẫu (Layout)
  const sampleLayout = await prisma.layoutTemplate.upsert({
    where: { id: 'default-fullscreen-layout' },
    update: {},
    create: {
      id: 'default-fullscreen-layout',
      name: 'Giao diện Chuẩn Toàn Màn Hình (Full HD)',
      description: 'Layout mặc định 1 vùng toàn màn hình 1920x1080',
      width: 1920,
      height: 1080,
      zones: [
        {
          id: 'zone-main',
          name: 'Vùng Chiếu Chính',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          type: 'media',
        },
      ],
    },
  });

  console.log(`✅ Đã tạo Layout mẫu: ${sampleLayout.name}`);
  console.log('🎉 Seed dữ liệu hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
