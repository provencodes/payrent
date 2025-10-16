import { Test, TestingModule } from '@nestjs/testing';
import { MailerController } from './mailer.controller';
import { EmailService } from '../mailer.service';

describe('MailerController', () => {
  let controller: MailerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailerController],
      providers: [EmailService],
    }).compile();

    controller = module.get<MailerController>(MailerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
