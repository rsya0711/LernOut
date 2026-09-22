import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user with initial gamification stats
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username.toLowerCase() }],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === dto.email.toLowerCase()) {
        throw new ConflictException('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      }
      throw new ConflictException('Username sudah digunakan. Silakan pilih username lain.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Random avatar based on username
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dto.username)}`;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username.toLowerCase(),
        fullName: dto.fullName || dto.username,
        passwordHash,
        avatarUrl,
        role: Role.USER,
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

    return {
      message: 'Registrasi berhasil! Selamat datang di LearnOut.',
      user,
      ...tokens,
    };
  }

  /**
   * Login with email or username
   */
  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: {
        managedCategories: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email/Username atau kata sandi tidak sesuai.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email/Username atau kata sandi tidak sesuai.');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

    return {
      message: 'Login berhasil.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        managedCategories: user.managedCategories,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(dto: RefreshTokenDto) {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') || 'learnout-super-refresh-secret-jwt-key-2026';

      const payload = this.jwtService.verify(dto.refreshToken, { secret: refreshSecret });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User tidak ditemukan.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

      return {
        message: 'Token berhasil diperbarui.',
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa.');
    }
  }

  /**
   * Get current authenticated user profile and stats
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        managedCategories: { select: { id: true, name: true, slug: true } },
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        lastActiveAt: true,
        userAchievements: {
          include: {
            achievement: true,
          },
        },
        courseProgresses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan.');
    }

    return user;
  }

  /**
   * Helper to generate Access and Refresh tokens
   */
  private async generateTokens(userId: string, email: string, username: string, role: string) {
    const payload = { sub: userId, email, username, role };

    const accessSecret =
      this.configService.get<string>('JWT_SECRET') || 'learnout-super-secret-jwt-key-2026';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'learnout-super-refresh-secret-jwt-key-2026';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 1 day in seconds
    };
  }
}
