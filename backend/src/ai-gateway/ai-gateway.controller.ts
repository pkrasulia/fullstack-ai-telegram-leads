import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { CreateAiGatewayDto } from './dto/create-ai-gateway.dto';
import { UpdateAiGatewayDto } from './dto/update-ai-gateway.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';

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

  @Post()
  create(@Body() createAiGatewayDto: CreateAiGatewayDto) {
    console.log('ai-gateway create route')
    return this.aiGatewayService.create(createAiGatewayDto);
  }

  @Get()
  findAll() {
    return this.aiGatewayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiGatewayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiGatewayDto: UpdateAiGatewayDto) {
    return this.aiGatewayService.update(+id, updateAiGatewayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiGatewayService.remove(+id);
  }
}
