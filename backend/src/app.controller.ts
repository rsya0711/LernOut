import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System & Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Root Information' })
  @ApiResponse({ status: 200, description: 'LearnOut API information' })
  getRoot() {
    return this.appService.getRootInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  getHealth() {
    return this.appService.getHealth();
  }
}
