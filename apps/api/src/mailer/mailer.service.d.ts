import { UserDto } from '../dto/user.dto';
import { EmailTemplate } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { User } from '@coolestprojects/database';
export declare enum MailTemplates {
    registration = "registration",
    waiting = "waiting",
    welcomeOwner = "welcomeOwner",
    welcomeCoWorker = "welcomeCoWorker",
    delete = "delete",
    warningNoProject = "warningNoProject",
    deadlineApproaching = "deadlineApproaching",
    waitingMail = "waitingMail",
    activation = "activation",
    ask4Token = "ask4Token",
    emailExists = "emailExists"
}
export declare class MailerService {
    private readonly eventModel;
    private readonly emailTemplateModel;
    constructor(eventModel: typeof Event, emailTemplateModel: typeof EmailTemplate);
    private sendMail;
    registrationMail(user: Registration, token: string): Promise<void>;
    waitingListMail(user: Registration): Promise<void>;
    welcomeMailOwner(user: User): Promise<void>;
    welcomeMailCoWorker(): Promise<void>;
    deleteMail(): Promise<void>;
    warningNoProject(): Promise<void>;
    deadlineApproaching(): Promise<void>;
    waitingMail(): Promise<void>;
    activationMail(): Promise<void>;
    ask4TokenMail(): Promise<void>;
    emailExistsMail(user: UserDto): Promise<void>;
    notifyProjectOwner(): Promise<void>;
}
