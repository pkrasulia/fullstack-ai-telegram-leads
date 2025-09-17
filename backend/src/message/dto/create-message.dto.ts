import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { MessageType, MessageDirection } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({ description: 'Telegram message ID' })
  @IsNotEmpty()
  @IsString()
  telegramMessageId: string;

  @ApiProperty({ description: 'Chat ID' })
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @ApiPropertyOptional({ description: 'From user ID' })
  @IsOptional()
  @IsString()
  fromUserId?: string;

  @ApiPropertyOptional({ description: 'From username' })
  @IsOptional()
  @IsString()
  fromUsername?: string;

  @ApiPropertyOptional({ description: 'From first name' })
  @IsOptional()
  @IsString()
  fromFirstName?: string;

  @ApiPropertyOptional({ description: 'From last name' })
  @IsOptional()
  @IsString()
  fromLastName?: string;

  @ApiPropertyOptional({ description: 'Message text' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ enum: MessageType, description: 'Message type' })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ enum: MessageDirection, description: 'Message direction' })
  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @ApiProperty({ description: 'Message date' })
  @IsDateString()
  messageDate: string;

  @ApiPropertyOptional({ description: 'Media information' })
  @IsOptional()
  @IsObject()
  mediaInfo?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
  };

  @ApiPropertyOptional({ description: 'Reply to information' })
  @IsOptional()
  @IsObject()
  replyTo?: {
    messageId: string;
    text?: string;
    fromUsername?: string;
  };

  @ApiPropertyOptional({ description: 'Forward information' })
  @IsOptional()
  @IsObject()
  forwardInfo?: {
    fromChatId?: string;
    fromMessageId?: string;
    fromUsername?: string;
    date?: Date;
  };

  @ApiPropertyOptional({ description: 'Is business message' })
  @IsOptional()
  @IsBoolean()
  isBusiness?: boolean;

  @ApiPropertyOptional({ description: 'Business connection ID' })
  @IsOptional()
  @IsString()
  businessConnectionId?: string;

  @ApiPropertyOptional({ description: 'Raw message data' })
  @IsOptional()
  @IsObject()
  rawData?: any;

  @ApiPropertyOptional({ description: 'Message sent by bot', default: false })
  @IsOptional()
  @IsBoolean()
  isBot?: boolean;
}
