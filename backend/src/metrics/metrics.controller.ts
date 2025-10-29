import { Controller, Get, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller({ path: 'metrics', version: '1' })
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Эндпоинт для получения метрик в формате Prometheus
   */
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(@Res() res: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getMetrics();
      res.send(metrics);
    } catch (error) {
      res
        .status(500)
        .send(
          `Error generating metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
  }

  /**
   * Эндпоинт для получения информации о приложении
   */
  @Get('info')
  getAppInfo(): Record<string, any> {
    return this.metricsService.getAppInfo();
  }

  /**
   * Эндпоинт для проверки здоровья сервиса метрик
   */
  @Get('health')
  getHealth(): Record<string, any> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'metrics',
    };
  }
}
