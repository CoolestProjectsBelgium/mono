import { UserDto } from '../dto/user.dto';
import { EmailTemplate } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { User } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
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
    private readonly projectModel;
    constructor(eventModel: typeof Event, emailTemplateModel: typeof EmailTemplate, projectModel: typeof Project);
    private buildRegistrationContext;
    private buildUserMailContext;
    private sendMail;
    private formatRecipients;
    registrationMail(user: Registration, token: string): Promise<void>;
    waitingListMail(user: Registration): Promise<void>;
    welcomeMailOwner(user: User, project: Project, token: string): Promise<void>;
    loginMail(user: User, token: string): Promise<void>;
    welcomeMailCoWorker(user: User, project: Project, token: string): Promise<void>;
    emailExistsMail(user: UserDto, eventId: number): Promise<void>;
    deleteMail(): Promise<void>;
    warningNoProject(): Promise<void>;
    deadlineApproaching(): Promise<void>;
    waitingMail(): Promise<void>;
    activationMail(): Promise<void>;
    ask4TokenMail(): Promise<void>;
    notifyProjectOwner(): Promise<void>;
}
