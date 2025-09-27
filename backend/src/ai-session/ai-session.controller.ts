import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiSessionService } from './ai-session.service';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';

@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.service)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('AI Sessions')
@Controller({
  path: 'ai-session',
  version: '1',
})
export class AiSessionController {
  constructor(private readonly aiSessionService: AiSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую сессию' })
  @ApiResponse({ status: 201, description: 'Сессия успешно создана' })
  @ApiResponse({ status: 400, description: 'Некоректные данные' })
  create(@Body() createAiSessionDto: CreateAiSessionDto) {
    return this.aiSessionService.create(createAiSessionDto);
  }
}
