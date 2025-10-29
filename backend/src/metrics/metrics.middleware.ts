import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Перехватываем событие завершения ответа
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const method = req.method;
      const route = req.route?.path || req.path;
      const statusCode = res.statusCode;

      // Записываем метрики
      this.metricsService.incrementHttpRequest(method, route, statusCode);
      this.metricsService.recordHttpRequestDuration(
        method,
        route,
        statusCode,
        duration,
      );
    });

    next();
  }
}
