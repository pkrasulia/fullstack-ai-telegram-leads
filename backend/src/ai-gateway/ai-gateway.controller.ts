import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { CreateAiGatewayDto } from './dto/create-ai-gateway.dto';
import { UpdateAiGatewayDto } from './dto/update-ai-gateway.dto';

@Controller('ai-gateway')
export class AiGatewayController {
  constructor(private readonly aiGatewayService: AiGatewayService) {}

  @Post()
  create(@Body() createAiGatewayDto: CreateAiGatewayDto) {
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
