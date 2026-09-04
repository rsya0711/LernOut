import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'budi@learnout.id', description: 'Email atau username pengguna' })
  @IsString()
  @IsNotEmpty({ message: 'Email atau username harus diisi.' })
  identifier: string;

  @ApiProperty({ example: 'user123', description: 'Kata sandi pengguna' })
  @IsString()
  @IsNotEmpty({ message: 'Password harus diisi.' })
  password: string;
}
