import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AiModelEnum {
  // google models
  'gemini-2.0-flash-001' = 'gemini-2.0-flash-001',
  'gemini-2.0-flash-002' = 'gemini-2.0-flash-002',
  'gemini-2.0-flash-003' = 'gemini-2.0-flash-003',
  // open ai models
  'gpt-4o' = 'gpt-4o',
  'gpt-4o-mini' = 'gpt-4o-mini',
  'gpt-4o-turbo' = 'gpt-4o-turbo',
  'gpt-4o-turbo-preview' = 'gpt-4o-turbo-preview',
  // claude models
  'claude-3-5-sonnet' = 'claude-3-5-sonnet',
  'claude-3-5-haiku' = 'claude-3-5-haiku',
  'claude-3-5-opus' = 'claude-3-5-opus',
  'claude-3-5-sonnet-20240620' = 'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20240620' = 'claude-3-5-haiku-20240620',
  'claude-3-5-opus-20240620' = 'claude-3-5-opus-20240620',
}

@Entity({ name: 'ai_gateway' })
export class AiGatewayEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Текст запроса
  @Column({ type: 'text' })
  text: string;

  // Фиксируем сколько токенов было использовано на запрос
  @Column()
  tokens: number;

  // Фиксируем модель запроса AI enum
  @Column({
    type: 'enum',
    enum: AiModelEnum,
  })
  model: AiModelEnum;

  @Index()
  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
