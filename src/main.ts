import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'basic-auth';
import { Logger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { initializeDataSource } from './database/datasource';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

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

  app.use(
    ['/api/docs', '/api/docs-json'],
    (req: Request, res: Response, next: NextFunction) => {
      const user = basicAuth(req);
      const username = process.env.SWAGGER_USER || 'payrent';
      const password = process.env.SWAGGER_PASSWORD || 'PAYRENT';

      if (!user || user.name !== username || user.pass !== password) {
        res.set('WWW-Authenticate', 'Basic realm="Swagger"');
        return res.status(401).send('Authentication required.');
      }
      next();
    },
  );

  app.enable('trust proxy');
  app.set('trust proxy', true);

  app.useLogger(logger);
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'api', 'api/v1', 'api/docs', 'health', 'probe'],
  });
  app.useGlobalInterceptors(new ResponseInterceptor());

  const options = new DocumentBuilder()
    .setTitle('PAYRENT API')
    .setDescription('API Documentation for PayRent Server')
    .setVersion('1.0')
    .addTag('PayRent Application')
    .addBearerAuth()
    // .setContact('Payrent Dev Team', 'https://sparkly.so', 'admin@sparkly.so')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    // .setTermsOfService('https://sparkly.so/terms')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Payrent API Docs',
  });

  const port = app.get<ConfigService>(ConfigService).get<number>('server.port');
  await app.listen(port);

  logger.log({
    message: 'server started 🚀',
    port,
    url: `http://localhost:${port}/api/v1`,
  });

  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap', err);
  process.exit(1);
});
