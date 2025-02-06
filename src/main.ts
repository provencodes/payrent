import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { initializeDataSource } from './database/datasource';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const logger = app.get(Logger);

  app.get(DataSource);

  try {
    await initializeDataSource();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    process.exit(1);
  }

  app.enable('trust proxy');
  app.useLogger(logger);
  // app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'api', 'api/v1', 'api/docs'],
  });
  const options = new DocumentBuilder()
  .setTitle('PAYRENT API')
  .setDescription('API Document for PayRent Server')
  .setVersion('1.0')
  .addTag('PayRent Application')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, options);
SwaggerModule.setup('api/docs', app, document);

const port = app.get<ConfigService>(ConfigService).get<number>('server.port');
await app.listen(port);

logger.log({
  message: 'server started 🚀',
  port,
  url: `http://localhost:${port}/api/docs`,
});


SwaggerModule.setup('swagger', app, document, {
  jsonDocumentUrl: 'swagger/json',
});

}
bootstrap().catch((err) => {
console.error('Error during bootstrap', err);
process.exit(1);
});