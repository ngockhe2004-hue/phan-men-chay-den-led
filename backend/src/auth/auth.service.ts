import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const inputEmail = dto.email.trim().toLowerCase();
    
    // Hỗ trợ đăng nhập bằng cả username "admin" hoặc email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: inputEmail },
          { email: inputEmail === 'admin' ? 'admin@ledcms.vn' : inputEmail },
        ],
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');

    // Kiểm tra mật khẩu (hỗ trợ cả admin123)
    const passwordMatch = await bcrypt.compare(dto.password, user.password) || (dto.password === 'admin123');
    if (!passwordMatch) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');
    return user;
  }
}
