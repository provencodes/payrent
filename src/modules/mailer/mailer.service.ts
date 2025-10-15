import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { SendMailDto } from './dto/send-mail.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { FAILED_TO_SEND_EMAIL } from '../../helpers/systemMessages';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAIL_API_KEY');
    if (!apiKey) {
      throw new Error('MAIL_API_KEY is required for Resend');
    }
    this.resend = new Resend(apiKey);
  }

  async sendEMail(sendMailDto: SendMailDto) {
    const { to, subject, template, context } = sendMailDto;
    
    try {
      // Compile template with context
      const htmlContent = await this.compileTemplate(template, context);
      
      const { data, error } = await this.resend.emails.send({
        from: 'PayRent <admin@theraptly.com>',
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(`Email sent to ${to} successfully with ID: ${data?.id}`);
      console.log("mail_data from resend: ", data);
      return data;
    } catch (e) {
      this.logger.error(
        `Could not send email to ${to}, Message: ${e.message}, Stack: ${e.stack}`,
      );
      throw new CustomHttpException(
        FAILED_TO_SEND_EMAIL,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async compileTemplate(templateName: string, context: any): Promise<string> {
    try {
      // Register layout partial
      const layoutPath = path.join(process.cwd(), 'src', 'templates', 'partials', 'layout.hbs');
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        handlebars.registerPartial('layout', layoutContent);
      }

      const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(context);
    } catch (error) {
      this.logger.error(`Template compilation failed: ${error.message}`);
      // Fallback to simple HTML if template fails
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">${context.subject || 'Email from PayRent'}</h1>
          <p>${context.message || 'Thank you for using PayRent!'}</p>
          <p>Best regards,<br>The PayRent Team</p>
        </div>
      `;
    }
  }
}
