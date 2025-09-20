import { MessageEntity } from 'src/message/entities/message.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'ai_sessions' })
export class AiSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', nullable: true })
  title?: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'adk_session_id' })
  adkSessionId: string;

  @OneToMany(() => MessageEntity, (message) => message.session, { cascade: true })
  messages: MessageEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
