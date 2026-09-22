import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
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

  @Patch('users/:id/categories')
  @ApiOperation({ summary: 'Ubah kategori yang dikelola admin' })
  @ApiResponse({ status: 200, description: 'Updated user managed categories' })
  updateUserCategories(
    @Param('id') id: string,
    @Body('categoryIds') categoryIds: string[],
  ) {
    return this.adminService.updateUserCategories(id, categoryIds);
  }

  @Post('courses')
  @ApiOperation({ summary: 'Buat kursus baru' })
  @ApiResponse({ status: 201, description: 'Created course' })
  createCourse(@CurrentUser() user: any, @Body() data: any) {
    return this.adminService.createCourse(user, data);
  }

  @Patch('courses/:id')
  @ApiOperation({ summary: 'Update kursus' })
  @ApiResponse({ status: 200, description: 'Updated course' })
  updateCourse(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.adminService.updateCourse(user, id, data);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Hapus kursus' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  deleteCourse(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteCourse(user, id);
  }

  // --- Curriculum Builder Endpoints ---

  @Post('modules')
  @ApiOperation({ summary: 'Tambah modul ke kursus' })
  createModule(@CurrentUser() user: any, @Body() data: any) {
    return this.adminService.createModule(user, data);
  }

  @Delete('modules/:id')
  deleteModule(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteModule(user, id);
  }

  @Post('lessons')
  @ApiOperation({ summary: 'Tambah pelajaran ke modul' })
  createLesson(@CurrentUser() user: any, @Body() data: any) {
    return this.adminService.createLesson(user, data);
  }

  @Delete('lessons/:id')
  deleteLesson(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteLesson(user, id);
  }

  @Post('quizzes')
  @ApiOperation({ summary: 'Tambah kuis evaluasi ke modul' })
  createQuiz(@CurrentUser() user: any, @Body() data: any) {
    return this.adminService.createQuiz(user, data);
  }

  @Post('questions')
  @ApiOperation({ summary: 'Tambah soal ke kuis' })
  createQuestion(@CurrentUser() user: any, @Body() data: any) {
    return this.adminService.createQuestion(user, data);
  }
}
