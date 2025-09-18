import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { CreateAiGatewayDto } from './dto/create-ai-gateway.dto';
import { UpdateAiGatewayDto } from './dto/update-ai-gateway.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiGatewayEntity } from './entities/ai-gateway.entity';

@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.service)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('AiGateway')
@Controller({
  path: 'ai-gateway',
  version: '1',
})
export class AiGatewayController {
  constructor(private readonly aiGatewayService: AiGatewayService) {}

  /* 
  @ApiOperation({ summary: 'Создать новый AI запрос' })
  @ApiResponse({ status: 201, description: 'AI запрос успешно создан', type: AiGateway })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  */
  @Post()
  @ApiOperation({ summary: 'Создать новый AI запрос' })
  @ApiResponse({
    status: 201,
    description: 'AI запрос успешно создан',
    type: AiGatewayEntity,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async create(@Body() createAiGatewayDto: CreateAiGatewayDto) {
    const result = await this.aiGatewayService.create(createAiGatewayDto);

    if (!result.success) {
      throw new HttpException(
        {
          message: 'AI Gateway request failed',
          error: result.error,
          timestamp: result.timestamp,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }
}
