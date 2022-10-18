import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(private _logger: PinoLogger) {
    this._logger.setContext(RedisService.name);
  }
  private redis: Redis;

  /**
   * It connects to the redis server and logs the response from the ping command.
   */
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

  /**
   * It fetches all the keys from the Redis database that match the given pattern
   * @param {string} pattern - The pattern to match against.
   * @returns An array of strings
   */
  async getKeys(pattern: string): Promise<string[]> {
    this._logger.debug(`request to fetch keys for pattern: ${pattern}`);
    return await this.redis.keys(pattern).catch((e) => {
      this._logger.error(e, `error on getting keys`);
      throw new Error(e.message);
    });
  }

  /**
   * It takes a key and a value, and sets the value in the redis cache
   * @param {string} key - The key to set the value for.
   * @param {any} value - The value to set.
   */
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
  /**
   * It fetches the value of a key from the Redis database
   * @param {string} key - The key to fetch the value from.
   * @param {boolean} parse - boolean - if true, the data will be parsed to JSON.
   * @returns The value of the key in the redis database.
   */
  async getValue(key: string, parse: boolean) {
    this._logger.debug(`fetching data for key: ${key} and parse is: ${parse}`);

    /* Checking if the data is a string or an object. If it is a string, it will return the string. If it
is an object, it will parse the data to JSON and return it. */
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
  /**
   * It adds data to a list
   * @param {string} key - string - the key of the list
   * @param {string[]} data - string[] - the data to be added to the list
   * @returns The number of elements added to the list.
   */
  async lPushToList(key: string, data: string[]) {
    this._logger.debug(`adding ${data} to list`);
    return await this.redis.lpush(key, ...data).catch((e) => {
      this._logger.error(e, `error on adding data to list`);
      throw new Error(e.message);
    });
  }
  /**
   * It deletes a key from the Redis database
   * @param {string} key - The key to be deleted
   * @returns The number of keys that were removed.
   */
  async deleteKey(key: string) {
    return await this.redis.del(key).catch((e) => {
      this._logger.error(e, `error on adding data to list`);
      throw new Error(e.message);
    });
  }
  /**
   * It fetches a range of elements from a list
   * @param {string} key - The key of the list
   * @param {number} from - The starting index of the range.
   * @param {number} to - The index of the last element to get.
   */
  async getLrangeFromList(key: string, from: number, to: number) {
    return await this.redis.lrange(key, from, to).catch((e) => {
      this._logger.error(e, `error on fetching data from list`);
      throw new Error(e.message);
    });
  }
}
