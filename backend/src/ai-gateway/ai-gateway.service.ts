import { Injectable } from '@nestjs/common';
import { CreateAiGatewayDto } from './dto/create-ai-gateway.dto';
import { UpdateAiGatewayDto } from './dto/update-ai-gateway.dto';

@Injectable()
export class AiGatewayService {
  create(createAiGatewayDto: CreateAiGatewayDto) {
    return 'This action adds a new aiGateway';
  }

  findAll() {
    return `This action returns all aiGateway`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiGateway`;
  }

  update(id: number, updateAiGatewayDto: UpdateAiGatewayDto) {
    return `This action updates a #${id} aiGateway`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiGateway`;
  }
}
