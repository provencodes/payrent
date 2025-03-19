import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './mailer.service';
import { skipAuth } from '../../helpers/skipAuth';

@skipAuth()
@Controller('mailer')
export class MailerController {
  constructor(private readonly emailService: EmailService) {}
  @Post()
  async sendEmail(@Body() payload) {
    try {
      const data = {
        to: payload.to,
        subject: payload.subject,
        template: 'email-verification',
        context: {
          username: payload.username,
          verificationUrl: 'jjjsjs',
        },
      };
      await this.emailService.sendEMail(data);
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
