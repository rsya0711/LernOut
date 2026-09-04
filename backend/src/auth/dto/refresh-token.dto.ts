import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT Refresh Token yang valid' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token tidak boleh kosong.' })
  refreshToken: string;
}
