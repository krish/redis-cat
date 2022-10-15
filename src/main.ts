import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('redis-cat');
  app.enableCors();
  let configuration: Omit<OpenAPIObject, 'paths'>;
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
  await app.listen(port, () =>
    console.log(`Application started on port ${port}`),
  );
}
bootstrap();
