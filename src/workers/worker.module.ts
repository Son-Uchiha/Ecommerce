import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { EmailConsumers } from 'src/consumer/email.consumer';
console.log('Worker start');
@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"Ecommerce" <B23DCCN720@gmail.com>',
      },
      template: {
        dir: join(__dirname, '..', '..', 'mail', 'templates'),

        adapter: new EjsAdapter(),

        options: {
          strict: false,
        },
      },
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: 'mail_queue',
    }),
  ],
  providers: [EmailConsumers],
})
export class WorkerModule {}
