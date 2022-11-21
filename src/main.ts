import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Logger, PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  /* Setting up the logger to use pino. */
  app.useLogger(app.get(Logger));
  /* Setting the prefix for all the routes. */
  app.setGlobalPrefix('redis-cat');
  /* It enables CORS for all the routes. */
  app.enableCors();
  let configuration: Omit<OpenAPIObject, 'paths'>;
  /* Checking if the environment variable SERVER_BASE_URL is set or not. If it is set, it will add the
  server name and base url to the swagger documentation. */
  if (process.env.SERVER_BASE_URL) {
    configuration = new DocumentBuilder()
      .setTitle('Redis Cat')
      .setDescription('Rest API wrapper for your Redis server')
      .addServer(process.env.SERVER_BASE_URL, process.env.SERVER_NAME)
      .setVersion('1.0.0')
      .build();
  } else {
    configuration = new DocumentBuilder()
      .setTitle('Redis Cat')
      .setDescription('Rest API wrapper for your Redis server')
      .setVersion('1.0.0')
      .build();
  }
  const document = SwaggerModule.createDocument(app, configuration);
  SwaggerModule.setup('/', app, document);

  const port = process.env.PORT || 8191;
  const logger = new PinoLogger({});
  logger.setContext('RedisCatApplication');
  await app.listen(port, () =>
    logger.info(`Application started on port ${port}`),
  );
}
bootstrap();
