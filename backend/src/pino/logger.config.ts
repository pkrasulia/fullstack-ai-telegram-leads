import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';

interface SerializedRequest {
  method: string;
  url: string;
}

interface SerializedResponse {
  statusCode: number;
}

interface SerializedError {
  message: string;
}

export const pinoConfig: LoggerModuleAsyncParams = {
  imports: [ConfigModule],
  useFactory: () => ({
    pinoHttp: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      customLogLevel: (
        req: IncomingMessage,
        res: ServerResponse<IncomingMessage>,
        err?: Error,
      ) => {
        if (err || (res.statusCode && res.statusCode >= 500)) return 'error';
        if (res.statusCode && res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (
        req: IncomingMessage,
        res: ServerResponse<IncomingMessage>,
      ) => `${req.method} ${req.url} -> ${res.statusCode}`,
      customErrorMessage: (
        req: IncomingMessage,
        res: ServerResponse<IncomingMessage>,
        err?: Error,
      ) =>
        `ERROR ${req.method} ${req.url} -> ${res.statusCode}: ${err?.message}`,
      serializers: {
        req(req: IncomingMessage): SerializedRequest {
          return {
            method: req.method || 'UNKNOWN',
            url: req.url || '',
          };
        },
        res(res: ServerResponse<IncomingMessage>): SerializedResponse {
          return {
            statusCode: res.statusCode || 200,
          };
        },
        err(err?: Error): SerializedError | undefined {
          if (!err) return undefined;
          return { message: err.message };
        },
      },
      // => теперь логи пойдут в stdout, а их подберёт Promtail
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                singleLine: true,
              },
            }
          : undefined,
    },
  }),
  inject: [ConfigService],
};
