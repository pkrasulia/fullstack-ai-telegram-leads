import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// DTO для создания AI запроса
export class CreateAiGatewayDto {
  @ApiProperty({ description: 'Текст запроса' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'ID пользователя Telegram (опционально)',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'ID сессии (опционально)', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
