import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '@prisma/client';

export class CourseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search term for title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CourseLevel, description: 'Filter by difficulty level' })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;
}
