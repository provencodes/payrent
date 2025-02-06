import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import dataSource from './database/datasource';
import serverConfig from './config/server.config';
import { AuthModule } from './modules/auth/auth.module';



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
          // forbidNonWhitelisted: true,
        }),
    },
  ],
  imports: [ConfigModule.forRoot({
    envFilePath: ['.env.development.local', `.env.${process.env.PROFILE}`],
    isGlobal: true,
    load: [serverConfig],
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
  LoggerModule.forRoot(),
  TypeOrmModule.forRootAsync({
    useFactory: async () => ({
      ...dataSource.options,
    }),
    dataSourceFactory: async () => dataSource,
  }),
  UserModule,
  AuthModule,
],
})
export class AppModule {}
