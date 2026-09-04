import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswerItemDto {
  @ApiProperty({ description: 'ID Pertanyaan' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'ID Opsi yang dipilih user (opsional jika dikosongkan)' })
  @IsString()
  @IsOptional()
  selectedOptionId?: string;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuizAnswerItemDto], description: 'Daftar jawaban user' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerItemDto)
  answers: QuizAnswerItemDto[];
}
