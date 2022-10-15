import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(private _logger: PinoLogger) {
    this._logger.setContext(RedisService.name);
  }
  private redis: Redis;
  async onModuleInit() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    this.redis.on('connect', async () => {
      this._logger.info(`connected to REDIS server`);
    });
    this.redis.on('error', (error) => {
      throw new Error(`cannot connect to redis ${JSON.stringify(error)}`);
    });
    this._logger.info(`response from redis ping: ${await this.redis.ping()}`);
  }

  async getKeys(pattern: string): Promise<string[]> {
    this._logger.debug(`request to fetch keys for pattern: ${pattern}`);
    return await this.redis.keys(pattern).catch((e) => {
      this._logger.error(e, `error on getting keys`);
      throw new Error(e.message);
    });
  }

  async setValues(key: string, value: any) {
    this._logger.debug(
      `request to set values for key: ${key} type of value is ${typeof value}`,
    );

    switch (typeof value) {
      case 'string':
      case 'number':
        return await this.redis.set(key, value).catch((e) => {
          this._logger.error(e, `error on getting keys`);
          throw new Error(e.message);
        });
      default:
        return this.redis.set(key, JSON.stringify(value)).catch((e) => {
          this._logger.error(e, `error on getting keys`);
          throw new Error(e.message);
        });
    }
  }
  async getValue(key: string, parse: boolean) {
    this._logger.debug(`fetching data for key: ${key} and parse is: ${parse}`);

    if (parse) {
      const data = await this.redis.get(key).catch((e) => {
        this._logger.error(e, `error on getting values`);
        throw new Error(e.message);
      });
      if (data) return JSON.parse(data);
      else return null;
    } else
      return await this.redis.get(key).catch((e) => {
        this._logger.error(e, `error on getting values`);
        throw new Error(e.message);
      });
  }
  async lPushToList(key: string, data: string[]) {
    this._logger.debug(`adding ${data} to list`);
    return await this.redis.lpush(key, ...data).catch((e) => {
      this._logger.error(e, `error on adding data to list`);
      throw new Error(e.message);
    });
  }
  async deleteKey(key: string) {
    return await this.redis.del(key).catch((e) => {
      this._logger.error(e, `error on adding data to list`);
      throw new Error(e.message);
    });
  }
  async getLrangeFromList(key: string, from: number, to: number) {
    return await this.redis.lrange(key, from, to).catch((e) => {
      this._logger.error(e, `error on fetching data from list`);
      throw new Error(e.message);
    });
  }
}
