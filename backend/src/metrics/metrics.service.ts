import { Injectable } from '@nestjs/common';
import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly memoryUsage: Gauge<string>;

  constructor() {
    // Собираем стандартные метрики Node.js
    collectDefaultMetrics({ register });

    // Метрика для измерения времени выполнения HTTP запросов
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    // Счетчик HTTP запросов
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Gauge для активных соединений
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    // Gauge для использования памяти
    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
    });

    // Регистрируем метрики
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.httpRequestTotal);
    register.registerMetric(this.activeConnections);
    register.registerMetric(this.memoryUsage);

    // Обновляем метрики памяти каждые 5 секунд
    setInterval(() => {
      this.updateMemoryMetrics();
    }, 5000);
  }

  /**
   * Получить все метрики в формате Prometheus
   */
  getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Увеличить счетчик HTTP запросов
   */
  incrementHttpRequest(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    this.httpRequestTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  /**
   * Записать время выполнения HTTP запроса
   */
  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration,
    );
  }

  /**
   * Установить количество активных соединений
   */
  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  /**
   * Обновить метрики использования памяти
   */
  private updateMemoryMetrics(): void {
    const memUsage = process.memoryUsage();
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);
  }

  /**
   * Получить информацию о приложении
   */
  getAppInfo(): Record<string, any> {
    return {
      name: 'def_nest',
      version: '0.0.1',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    };
  }
}
