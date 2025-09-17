import { PartialType } from '@nestjs/swagger';
import { CreateAiGatewayDto } from './create-ai-gateway.dto';

export class UpdateAiGatewayDto extends PartialType(CreateAiGatewayDto) {}
