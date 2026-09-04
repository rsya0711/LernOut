import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Detail lesson beserta materi, durasi, dan status penyelesaian' })
  @ApiResponse({ status: 200, description: 'Lesson content and navigation' })
  getLesson(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.getLessonById(id, user?.id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tandai lesson selesai, berikan reward XP, dan perbarui progres kursus' })
  @ApiResponse({ status: 200, description: 'Lesson completed and XP rewarded' })
  completeLesson(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.completeLesson(id, user.id);
  }
}
