import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  transport: {
    host: process.env.SMTP_HOST,
    port: +(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  defaults: {
    from: process.env.SMTP_USER,
  },
  template: {
    dir: __dirname + '/../modules/mail/templates',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
}));
