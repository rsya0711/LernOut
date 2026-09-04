import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExamAnswerItemDto {
  @ApiProperty({ description: 'ID Pertanyaan UTBK' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'ID Opsi yang dipilih (kosong jika tidak dijawab)', required: false })
  @IsString()
  @IsOptional()
  selectedOptionId?: string;

  @ApiProperty({ description: 'Status tombol ragu-ragu UTBK', default: false })
  @IsBoolean()
  @IsOptional()
  isDoubtful?: boolean;
}

export class SubmitExamDto {
  @ApiProperty({ type: [ExamAnswerItemDto], description: 'Daftar seluruh jawaban peserta tryout' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerItemDto)
  answers: ExamAnswerItemDto[];
}
