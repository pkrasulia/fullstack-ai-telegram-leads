import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiSessionService } from './ai-session.service';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import { UpdateAiSessionDto } from './dto/update-ai-session.dto';

@Controller('ai-session')
export class AiSessionController {
  constructor(private readonly aiSessionService: AiSessionService) {}

  @Post()
  create(@Body() createAiSessionDto: CreateAiSessionDto) {
    return this.aiSessionService.create(createAiSessionDto);
  }

  @Get()
  findAll() {
    return this.aiSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiSessionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiSessionDto: UpdateAiSessionDto) {
    return this.aiSessionService.update(+id, updateAiSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiSessionService.remove(+id);
  }
}
