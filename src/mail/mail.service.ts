import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  sendMail = async ({
    to,
    subject,
    template,
    context,
  }: {
    to: string;
    subject: string;
    template?: string;
    context?: {
      [name: string]: any;
    };
  }) => {
    await this.mailService.sendMail({
      from: 'B.stella',
      to,
      subject,
      template,
      context,
    });
  };
}
