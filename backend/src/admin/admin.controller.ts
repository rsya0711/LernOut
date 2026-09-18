import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Ambil analitik platform: total user, kursus, attempt, dan skor rata-rata' })
  @ApiResponse({ status: 200, description: 'Platform analytics metrics' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Daftar pengguna terdaftar untuk manajemen admin' })
  @ApiResponse({ status: 200, description: 'List of users' })
  getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Ubah role pengguna (USER <-> ADMIN)' })
  @ApiResponse({ status: 200, description: 'Updated user role' })
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Post('courses')
  @ApiOperation({ summary: 'Buat kursus baru' })
  @ApiResponse({ status: 201, description: 'Created course' })
  createCourse(@Body() data: any) {
    return this.adminService.createCourse(data);
  }

  @Patch('courses/:id')
  @ApiOperation({ summary: 'Update kursus' })
  @ApiResponse({ status: 200, description: 'Updated course' })
  updateCourse(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.adminService.updateCourse(id, data);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Hapus kursus' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  // --- Curriculum Builder Endpoints ---

  @Post('modules')
  @ApiOperation({ summary: 'Tambah modul ke kursus' })
  createModule(@Body() data: any) {
    return this.adminService.createModule(data);
  }

  @Delete('modules/:id')
  deleteModule(@Param('id') id: string) {
    return this.adminService.deleteModule(id);
  }

  @Post('lessons')
  @ApiOperation({ summary: 'Tambah pelajaran ke modul' })
  createLesson(@Body() data: any) {
    return this.adminService.createLesson(data);
  }

  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) {
    return this.adminService.deleteLesson(id);
  }

  @Post('quizzes')
  @ApiOperation({ summary: 'Tambah kuis evaluasi ke modul' })
  createQuiz(@Body() data: any) {
    return this.adminService.createQuiz(data);
  }

  @Post('questions')
  @ApiOperation({ summary: 'Tambah soal ke kuis' })
  createQuestion(@Body() data: any) {
    return this.adminService.createQuestion(data);
  }
}
