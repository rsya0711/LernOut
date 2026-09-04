import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        lastActiveAt: true,
        createdAt: true,
        _count: {
          select: {
            courseProgresses: true,
            quizAttempts: true,
            examAttempts: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
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
      },
    });
  }
}
