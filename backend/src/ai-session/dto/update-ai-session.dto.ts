import { PartialType } from '@nestjs/swagger';
import { CreateAiSessionDto } from './create-ai-session.dto';

export class UpdateAiSessionDto extends PartialType(CreateAiSessionDto) {}
