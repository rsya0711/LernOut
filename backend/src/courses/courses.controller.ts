import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Daftar semua kategori kursus (UTBK, Matematika, dll)' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  getCategories() {
    return this.coursesService.getCategories();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Daftar katalog kursus yang dipublikasikan' })
  @ApiResponse({ status: 200, description: 'List of courses with user progress if authenticated' })
  getCourses(
    @Query() query: CourseQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.getCourses(query, user?.id);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Detail kursus berdasarkan slug atau ID beserta modul dan lesson' })
  @ApiResponse({ status: 200, description: 'Detailed course structure' })
  getCourse(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.getCourseBySlug(slug, user?.id);
  }
}
