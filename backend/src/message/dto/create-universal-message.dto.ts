import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { MessageType, MessageDirection } from '../entities/message.entity';

export class CreateUniversalMessageDto {
  @ApiProperty({ description: 'Текст сообщения' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({ 
    enum: MessageType, 
    description: 'Тип сообщения',
    default: MessageType.TEXT
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @ApiProperty({ 
    enum: MessageDirection, 
    description: 'Направление сообщения',
    default: MessageDirection.INCOMING
  })
  @IsEnum(MessageDirection)
  @IsOptional()
  direction?: MessageDirection = MessageDirection.INCOMING;

  @ApiPropertyOptional({ description: 'Является ли сообщение от бота', default: false })
  @IsOptional()
  @IsBoolean()
  isBot?: boolean = false;

  @ApiPropertyOptional({ description: 'Дополнительные метаданные' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'ID сессии' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
