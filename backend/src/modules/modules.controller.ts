import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Detail modul kursus beserta daftar lessons dan kuis' })
  @ApiResponse({ status: 200, description: 'Module detail with lessons' })
  getModule(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.modulesService.getModuleById(id, user?.id);
  }
}
