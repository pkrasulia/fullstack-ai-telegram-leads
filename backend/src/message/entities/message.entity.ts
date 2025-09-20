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
@Index(['messageDate'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
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

  @Column({ type: 'boolean', default: false, name: 'is_business' })
  isBusiness: boolean;

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