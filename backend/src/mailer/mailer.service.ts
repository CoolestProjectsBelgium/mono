import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class MailerService {
  async registrationMail(user: UserDto, token: string) {
    throw new Error('Method not implemented.');
  }
  async waitingListMail(user: UserDto) {
    throw new Error('Method not implemented.');
  }
  constructor() {}

  async welcomeMailOwner() {}
  async welcomeMailCoWorker() {}
  async deleteMail() {}
  async warningNoProject() {}
  async deadlineApproaching() {}
  async waitingMail() {}
  async activationMail() {}
  async ask4TokenMail() {}
  async emailExistsMail(user: UserDto) {}
}
