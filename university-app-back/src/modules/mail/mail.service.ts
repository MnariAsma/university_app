import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendCredentials(
    to: string,
    firstName: string,
    password: string,
    role: string,
  ) {
    await this.mailerService.sendMail({
      to,
      from: process.env.SMTP_FROM,
      subject: 'Your login credentials',
      template: 'credentials',
      context: {
        firstName,
        email: to,
        password,
        role,
      },
    });

    this.logger.log(`Email sent to ${to}`);
  }
}
