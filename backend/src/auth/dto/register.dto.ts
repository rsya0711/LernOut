import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'budi@learnout.id', description: 'Alamat email pengguna' })
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email: string;

  @ApiProperty({ example: 'budisantoso', description: 'Username unik pengguna' })
  @IsString({ message: 'Username harus berupa teks.' })
  @IsNotEmpty({ message: 'Username tidak boleh kosong.' })
  @MinLength(3, { message: 'Username minimal 3 karakter.' })
  username: string;

  @ApiProperty({ example: 'Password123!', description: 'Kata sandi minimal 6 karakter' })
  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password: string;

  @ApiPropertyOptional({ example: 'Budi Santoso', description: 'Nama lengkap pengguna' })
  @IsOptional()
  @IsString()
  fullName?: string;
}
