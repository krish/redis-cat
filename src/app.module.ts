import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule,
    /* Setting up the logger. */
    LoggerModule.forRoot({
      pinoHttp: [
        {
          name: 'Redis Cat',
          level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty' }
              : undefined,
          redact: ['authorization', 'req.headers.authorization'],
          autoLogging: false,
        },
        process.stdout,
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
