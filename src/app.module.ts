import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import authConfig from '../config/auth.config';
import serverConfig from '../config/server.config';
import dataSource from './database/datasource';
import { AuthGuard } from './guards/auth.guard';
import HealthController from './health.controller';
import ProbeController from './probe.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MailerModule as CustomMailerModule } from './modules/mailer/mailer.module';
import { PropertyModule } from './modules/property/property.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CommercialModule } from './modules/commercial/commercial.module';
import { LegalModule } from './modules/legal/legal.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from './helpers/http-exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();

const profile = process.env.PROFILE;
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useClass: ConfigService,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', `.env.${profile}`],
      isGlobal: true,
      load: [serverConfig, authConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .required(),
        PROFILE: Joi.string()
          .valid(
            'local',
            'development',
            'production',
            'ci',
            'testing',
            'staging',
          )
          .required(),
        PORT: Joi.number().required(),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSource.options,
      }),
      dataSourceFactory: async () => dataSource,
    }),
    UserModule,
    AuthModule,
    PropertyModule,
    CloudinaryModule,
    PaymentModule,
    CommercialModule,
    LegalModule,
    TenantModule,
    CustomMailerModule,
  ],
  controllers: [HealthController, ProbeController],
})
export class AppModule { }
