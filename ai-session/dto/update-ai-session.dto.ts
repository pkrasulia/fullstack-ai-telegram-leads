import { PartialType } from '@nestjs/mapped-types';
import { CreateAiSessionDto } from './create-ai-session.dto';

export class UpdateAiSessionDto extends PartialType(CreateAiSessionDto) {}
