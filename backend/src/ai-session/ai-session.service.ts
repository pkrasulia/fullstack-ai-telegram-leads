import { Injectable } from '@nestjs/common';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import { UpdateAiSessionDto } from './dto/update-ai-session.dto';

@Injectable()
export class AiSessionService {
  create(createAiSessionDto: CreateAiSessionDto) {
    return 'This action adds a new aiSession';
  }

  findAll() {
    return `This action returns all aiSession`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiSession`;
  }

  update(id: number, updateAiSessionDto: UpdateAiSessionDto) {
    return `This action updates a #${id} aiSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiSession`;
  }
}
