import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ambil kuis dan daftar pertanyaan (opsi jawaban disanitasi tanpa kunci)' })
  @ApiResponse({ status: 200, description: 'Quiz payload for engine' })
  getQuiz(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.quizzesService.getQuizById(id, user?.id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Kirim jawaban kuis, hitung skor, akurasi, berikan XP, dan tampilkan pembahasan' })
  @ApiResponse({ status: 200, description: 'Quiz submission result with score and answer discussion' })
  submitQuiz(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(id, user.id, dto);
  }

  @Get('attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ambil riwayat pengerjaan kuis beserta ulasan pembahasan' })
  @ApiResponse({ status: 200, description: 'Quiz attempt review' })
  getAttemptResult(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: any,
  ) {
    return this.quizzesService.getAttemptResult(attemptId, user.id);
  }
}
