import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Mendaftarkan akun baru (Role: USER)' })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil, mengembalikan token dan data user.' })
  @ApiResponse({ status: 409, description: 'Email atau username sudah terdaftar.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Masuk dengan Email atau Username' })
  @ApiResponse({ status: 200, description: 'Login berhasil, mengembalikan Access & Refresh Token.' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Memperbarui Access Token dengan Refresh Token' })
  @ApiResponse({ status: 200, description: 'Token berhasil diperbarui.' })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid atau kedaluwarsa.' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengambil profil dan status gamifikasi pengguna aktif saat ini' })
  @ApiResponse({ status: 200, description: 'Profil pengguna berhasil didapatkan.' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Token tidak valid.' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Keluar dari sesi aplikasi' })
  @ApiResponse({ status: 200, description: 'Logout berhasil.' })
  async logout() {
    return { message: 'Berhasil logout dari sistem.' };
  }
}
