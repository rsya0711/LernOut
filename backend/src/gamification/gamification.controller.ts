import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Ambil daftar leaderboard ranking XP mingguan atau sepanjang masa' })
  @ApiQuery({ name: 'period', enum: ['weekly', 'alltime'], required: false })
  @ApiResponse({ status: 200, description: 'Leaderboard ranking' })
  getLeaderboard(@Query('period') period?: 'weekly' | 'alltime') {
    return this.gamificationService.getLeaderboard(period || 'alltime');
  }

  @Get('achievements')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Daftar semua badge pencapaian (achievements) dan status unlock user' })
  @ApiResponse({ status: 200, description: 'Achievements list' })
  getAchievements(@CurrentUser() user: any) {
    return this.gamificationService.getAchievements(user?.id);
  }

  @Post('check-achievements')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Trigger evaluasi dan klaim badge pencapaian baru' })
  @ApiResponse({ status: 200, description: 'Newly unlocked achievements' })
  checkAchievements(@CurrentUser() user: any) {
    return this.gamificationService.checkAndUnlockAchievements(user.id);
  }
}
