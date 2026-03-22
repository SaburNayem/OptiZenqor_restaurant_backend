import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async registerCustomer(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already in use');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: Role.customer,
        customerProfile: { create: {} },
      },
    });

    return this.issueTokens(user.id, user.email, user.role, []);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { assignedBranches: true } });
    if (!user || !user.passwordHash || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, user.role, user.assignedBranches.map((b) => b.branchId));
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: Role; branchIds: string[] }>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.issueTokens(payload.sub, payload.email, payload.role, payload.branchIds || []);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  forgotPassword(_email: string) {
    return { success: true, message: 'Password reset flow placeholder ready' };
  }

  logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  private async issueTokens(sub: string, email: string, role: Role, branchIds: string[]) {
    const payload = { sub, email, role, branchIds };
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
    return {
      success: true,
      data: {
        accessToken: await this.jwt.signAsync(payload, {
          secret: accessSecret,
          expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
        }),
        refreshToken: await this.jwt.signAsync(payload, {
          secret: refreshSecret,
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
        }),
      },
    };
  }
}
