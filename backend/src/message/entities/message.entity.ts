import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AiSessionEntity } from 'src/ai-session/entities/ai-session.entity';

export enum MessageType {
  TEXT = 'text',
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  VOICE = 'voice',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACT = 'contact',
  ANIMATION = 'animation',
  VIDEO_NOTE = 'video_note',
  OTHER = 'other',
}

export enum MessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

@Entity('messages')
@Index(['chatId', 'messageDate'])
@Index(['telegramMessageId'])
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'telegram_message_id' })
  telegramMessageId: string;

  @Column({ type: 'bigint', name: 'chat_id' })
  chatId: string;

  @Column({ type: 'bigint', name: 'from_user_id', nullable: true })
  fromUserId?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'from_username',
    nullable: true,
  })
  fromUsername?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: 'Имя пользователя', required: false })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: 'Фамилия пользователя', required: false })
  lastName?: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Сообщение отправлено ботом', default: false })
  isBot: boolean;

  @Column({ type: 'text', nullable: true })
  text?: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: MessageDirection,
    default: MessageDirection.INCOMING,
  })
  direction: MessageDirection;

  @Column({ type: 'timestamp', name: 'message_date' })
  messageDate: Date;

  @Column({ type: 'json', nullable: true, name: 'media_info' })
  mediaInfo?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
  };

  @Column({ type: 'json', nullable: true, name: 'reply_to' })
  replyTo?: {
    messageId: string;
    text?: string;
    fromUsername?: string;
  };

  @Column({ type: 'json', nullable: true, name: 'forward_info' })
  forwardInfo?: {
    fromChatId?: string;
    fromMessageId?: string;
    fromUsername?: string;
    date?: Date;
  };

  @Column({ type: 'boolean', default: false, name: 'is_business' })
  isBusiness: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'business_connection_id',
  })
  businessConnectionId?: string;

  @ManyToOne(() => AiSessionEntity, (session) => session.messages, {
    onDelete: 'CASCADE'
  })
  session: AiSessionEntity;

  @Column({ type: 'json', nullable: true, name: 'raw_data' })
  rawData?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
