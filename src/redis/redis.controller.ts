import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from './redis.service';
import * as rawbody from 'raw-body';
import { PinoLogger } from 'nestjs-pino';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller()
export class RedisController {
  constructor(private _redis: RedisService, private _logger: PinoLogger) {
    this._logger.setContext(RedisController.name);
  }

  /* This is a swagger decorator. */
  @ApiTags('Common')
  @ApiResponse({
    status: 200,
    description: 'Array of keys',
    type: String,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Get keys for the given pattern',
    description:
      'This will return all matching keys belongs to the given pattern. however given credentials may not have permission to access the value of this key ',
  })
  @Get('keys/:pattern')
  /**
   * It takes a pattern as a parameter, and returns the keys that match that pattern
   * @param {string} key - The key to get the value of.
   * @returns The keys that match the pattern
   */
  async getKeys(@Param('pattern') key: string) {
    return await this._redis.getKeys(key).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
  @ApiTags('Common')
  @Delete('keys/:key')
  /**
   * It takes a key as a parameter, and then calls the deleteKey function in the RedisService
   * @param {string} key - The key to delete
   * @returns The result of the deleteKey function.
   */
  async deleteKey(@Param('key') key: string) {
    return await this._redis.deleteKey(key).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
  @ApiTags('String')
  @ApiQuery({
    name: 'parse',
    description: 'set to true if you want to JSON.parse() the value',
    type: Boolean,
    required: false,
  })
  @Get('values/:key')
  /**
   * The function takes a key and a parse parameter. If parse is true, it will return the value of the
   * key as a JSON object. If parse is false, it will return the value of the key as a string
   * @param {string} key - The key to get the value for.
   * @param {boolean} parse - boolean - This is a query parameter that is optional. If it is not
   * provided, the default value is false.
   * @returns The value of the key.
   */
  async getValue(@Param('key') key: string, @Query('parse') parse: boolean) {
    //should not use if(parse) here as value comes as string
    if (typeof parse == 'string') parse = 'true' === parse;
    if (parse) {
      return await this._redis.getValue(key, true).catch((e) => {
        throw new InternalServerErrorException(e.message);
      });
    } else {
      return await this._redis.getValue(key, false).catch((e) => {
        throw new InternalServerErrorException(e.message);
      });
    }
  }

  @ApiTags('String')
  @ApiOperation({
    summary: 'Create value for the given key',
    description:
      'This will create the given value under the given key. even UI shows as `string` you can use `JSON` object and use `application/json` as content type',
  })
  @ApiResponse({
    status: 201,
    type: String,
  })
  @Post('values/:key')
  @ApiConsumes('text/plain', 'application/json')
  @ApiBody({
    description: 'you can add valid JSON object or srting here',
  })
  /**
   * It takes a key and a payload, and sets the value of the key to the payload
   * @param {string} key - The key to set the value to.
   * @param {string} payload - This is the body of the request.
   * @param {Request} req - Request - This is the request object that is passed to the controller.
   * @returns The value of the key
   */
  async setValue(
    @Param('key') key: string,
    @Body() payload: string,
    @Req() req: Request,
  ) {
    let processedPayload: any;
    if (req.readable) {
      const buffer: Buffer = await rawbody(req);
      processedPayload = buffer.toString();
    } else {
      processedPayload = payload;
    }
    return await this._redis.setValues(key, processedPayload).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
  @ApiTags('List')
  @Post('values/lists/lpush/:key')
  /**
   * "This function takes a key and a payload, and pushes the payload to the list at the key."
   *
   * The @Param() decorator is used to get the key from the URL. The @Body() decorator is used to get the
   * payload from the request body
   * @param {string} key - The key of the list you want to push to.
   * @param payload - [string]
   * @returns The number of elements in the list after the push operation.
   */
  async lPushToList(@Param('key') key: string, @Body() payload: [string]) {
    return await this._redis.lPushToList(key, payload).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
  @ApiTags('List')
  @Get('values/lists/lrange/:key')

  /**
   * It gets a range of values from a list stored in Redis
   * @param {string} key - The key of the list you want to get the range from.
   * @param {number} from - The starting index of the range.
   * @param {number} to - number,
   * @returns The list of values from the redis list.
   */
  async getLrangeFromList(
    @Param('key') key: string,
    @Query('from') from: number,
    @Query('to') to: number,
  ) {
    return await this._redis.getLrangeFromList(key, from, to).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
}
