import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Название сессии' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'ID пользователя' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Дополнительные метаданные', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
