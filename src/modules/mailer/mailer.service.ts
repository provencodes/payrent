import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './dto/send-mail.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { FAILED_TO_SEND_EMAIL } from '../../helpers/systemMessages';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly mailerService: MailerService) {}
  async sendEMail(sendMailDto: SendMailDto) {
    const { to, subject, template, context } = sendMailDto;
    const sendSuccess = await this.mailerService
      .sendMail({
        to,
        subject,
        template,
        context,
      })
      .catch((e) => {
        this.logger.error(
          `Could not send email to ${to}, Message: ${e.message}, Stack: ${e.stack}`,
        );
        throw new CustomHttpException(
          FAILED_TO_SEND_EMAIL,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    if (sendSuccess) {
      this.logger.log(`Verification mail sent to ${to} successfully...`);
    }
  }
}
