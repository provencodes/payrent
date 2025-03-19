import { Module } from '@nestjs/common';
import { EmailService } from './mailer.service';
import { MailerController } from './mailer.controller';

@Module({
  imports: [],
  controllers: [MailerController],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailerModule {}
