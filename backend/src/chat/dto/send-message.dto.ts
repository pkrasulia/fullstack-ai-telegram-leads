import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import {
  MessageType,
  MessageDirection,
} from '../../message/entities/message.entity';

export class SendMessageDto {
  @ApiProperty({ description: 'ID сессии' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Текст сообщения' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    enum: MessageType,
    description: 'Тип сообщения',
    default: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @ApiProperty({
    enum: MessageDirection,
    description: 'Направление сообщения',
    default: MessageDirection.INCOMING,
  })
  @IsEnum(MessageDirection)
  @IsOptional()
  direction?: MessageDirection = MessageDirection.INCOMING;

  @ApiPropertyOptional({ description: 'Дополнительные метаданные' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Является ли сообщение от бота',
    default: false,
  })
  @IsOptional()
  isBot?: boolean = false;
}
