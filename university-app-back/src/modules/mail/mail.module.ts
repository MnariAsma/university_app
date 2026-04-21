import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import emailConfig from 'src/config/email.config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [emailConfig] }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get('email.transport'),
        defaults: configService.get('email.defaults'),
        template: {
          ...configService.get('email.template'),
          dir: join(process.cwd(), 'src/modules/mail/templates'),
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
