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
  async getKeys(@Param('pattern') key: string) {
    return await this._redis.getKeys(key).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
  @ApiTags('Common')
  @Delete('keys/:key')
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
  async lPushToList(@Param('key') key: string, @Body() payload: [string]) {
    return await this._redis.lPushToList(key, payload).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
  @ApiTags('List')
  @Get('values/lists/lrange/:key')
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
