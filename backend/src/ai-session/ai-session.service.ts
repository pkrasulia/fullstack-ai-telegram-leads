import { Injectable } from '@nestjs/common';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import { UpdateAiSessionDto } from './dto/update-ai-session.dto';
import { AiGatewayService } from 'src/ai-gateway/ai-gateway.service';
import { Repository } from 'typeorm';
import { AiSessionEntity } from './entities/ai-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

@Injectable()
export class AiSessionService {
  private readonly logger = new Logger(AiSessionService.name);

  constructor(
    private readonly aiGatewayService: AiGatewayService,
    @InjectRepository(AiSessionEntity)
    private readonly aiSessionRepository: Repository<AiSessionEntity>,
  ) {}
  async create(
    createAiSessionDto: CreateAiSessionDto,
  ): Promise<AiSessionEntity> {
    try {
      // Создаём ADK-сессию через сервис-шлюз
      const newSessionId = await this.aiGatewayService.createAdkSession(
        createAiSessionDto.user_id,
      );
      if (!newSessionId) {
        throw new Error('Не удалось получить идентификатор ADK-сессии.');
      }

      // Создаём сущность для сохранения в базе
      const newSessionEntity = this.aiSessionRepository.create({
        title: createAiSessionDto.title.trim(),
        adkSessionId: newSessionId,
        userId: createAiSessionDto.user_id,
        userName: createAiSessionDto.user_name,
      });

      // Сохраняем и возвращаем готовую сущность
      return await this.aiSessionRepository.save(newSessionEntity);
    } catch (error) {
      // Логируем и пробрасываем исключение с контекстом
      this.logger.error('Ошибка при создании AI-сессии', {
        error,
        dto: createAiSessionDto,
      });
      throw new Error(
        `Ошибка при создании AI-сессии: ${(error as Error).message}`,
      );
    }
  }
}
