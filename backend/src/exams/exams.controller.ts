import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Exams (UTBK / Tryout)')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Daftar paket Simulasi Tryout UTBK / SNBT yang tersedia' })
  @ApiResponse({ status: 200, description: 'List of exam packages' })
  getExams(@CurrentUser() user: any) {
    return this.examsService.getExams(user?.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Riwayat pengerjaan tryout pengguna' })
  @ApiResponse({ status: 200, description: 'Exam attempt history' })
  getUserExamHistory(@CurrentUser() user: any) {
    return this.examsService.getUserExamHistory(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail paket tryout' })
  @ApiResponse({ status: 200, description: 'Exam package details' })
  getExamById(@Param('id') id: string) {
    return this.examsService.getExamById(id);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mulai sesi simulasi tryout berwaktu (menghasilkan attemptId & timer)' })
  @ApiResponse({ status: 201, description: 'Exam started payload with sanitized questions' })
  startExam(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.examsService.startExam(id, user.id);
  }

  @Post('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Kumpulkan jawaban tryout UTBK, hitung skor skala IRT, & breakdown subtes' })
  @ApiResponse({ status: 200, description: 'Exam result report' })
  submitExam(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitExamDto,
  ) {
    return this.examsService.submitExam(attemptId, user.id, dto);
  }

  @Get('attempts/:attemptId/results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ambil laporan hasil tryout dan pembahasan lengkap setiap butir soal' })
  @ApiResponse({ status: 200, description: 'Detailed result breakdown' })
  getAttemptResult(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: any,
  ) {
    return this.examsService.getAttemptResult(attemptId, user.id);
  }
}
