import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  async onModuleInit() {
    // Auto-generate Ethereal test account on startup
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    this.logger.log(`📧 Ethereal account: ${testAccount.user}`);
    this.logger.log(`🔗 View sent emails at: https://ethereal.email/login`);
    this.logger.log(`   Login with: ${testAccount.user} / ${testAccount.pass}`);
  }

  async sendCredentials(
    to: string,
    firstName: string,
    plainPassword: string,
    role: string,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: '"University App" <noreply@university.app>',
      to,
      subject: 'Your University App Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Welcome, ${firstName}!</h2>
          <p>Your account has been created as <strong>${role}</strong>.</p>
          <p>Here are your login credentials:</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Password</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${plainPassword}</td>
            </tr>
          </table>
          <p style="margin-top: 16px;">Please log in and change your password as soon as possible.</p>
          <p>University App Team</p>
        </div>
      `,
    });

    // Log the preview URL so you can click it and see the email
    this.logger.log(`✅ Email sent to ${to}`);
    this.logger.log(`👁️  Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}