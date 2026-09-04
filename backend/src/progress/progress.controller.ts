import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('me')
  @ApiOperation({ summary: 'Ambil statistik belajar, level, XP progress, akurasi, dan streak user' })
  @ApiResponse({ status: 200, description: 'User progress summary' })
  getUserProgress(@CurrentUser() user: any) {
    return this.progressService.getUserProgress(user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Ambil riwayat aktivitas belajar 30 hari terakhir' })
  @ApiResponse({ status: 200, description: 'Activity streak logs' })
  getUserActivity(@CurrentUser() user: any) {
    return this.progressService.getUserActivity(user.id);
  }
}
