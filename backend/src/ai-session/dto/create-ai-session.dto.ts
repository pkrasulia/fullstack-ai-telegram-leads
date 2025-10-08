import { IsString } from 'class-validator';

export class CreateAiSessionDto {
  @IsString()
  title: string;

  @IsString()
  user_id: string;

  user_name: string;
}
