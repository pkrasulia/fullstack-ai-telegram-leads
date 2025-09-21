import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { MessageEntity } from '../../message/entities/message.entity';

@Entity('telegram_messages')
export class TelegramMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => MessageEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  message: MessageEntity;

  @Column({ type: 'bigint', name: 'telegram_message_id' })
  telegramMessageId: string;

  @Column({ type: 'bigint', nullable: true, name: 'from_user_id' })
  fromUserId?: string;

  @Column({ type: 'citext', nullable: true, name: 'from_username' })
  fromUsername?: string;

  @Column({ type: 'text', nullable: true, name: 'first_name' })
  firstName?: string;

  @Column({ type: 'text', nullable: true, name: 'last_name' })
  lastName?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'media_info' })
  mediaInfo?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
  };

  @Column({ type: 'jsonb', nullable: true, name: 'reply_to' })
  replyTo?: {
    messageId: string;
    text?: string;
    fromUsername?: string;
  };

  @Column({ type: 'jsonb', nullable: true, name: 'forward_info' })
  forwardInfo?: {
    fromChatId?: string;
    fromMessageId?: string;
    fromUsername?: string;
    date?: Date;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
