// mail.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('mail_queue')
export class EmailConsumers extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(job.data.id);
    if (job.name === 'login-notice') {
      const { email, name } = job.data;
      try {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Cảnh báo đăng nhập',
          template: 'login-notice',
          context: {
            name: name,
            time: new Date().toLocaleString(),
          },
        });
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Failed to send email:', error);
      }
      return { sent: true, to: email };
    }
  }
}
