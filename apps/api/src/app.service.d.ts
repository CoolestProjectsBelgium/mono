import { TshirtGroupDto } from './dto/tshirt-group.dto';
import { QuestionDto } from './dto/question.dto';
import { TshirtGroup } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { InfoDto } from './dto/info.dto';
import { ApprovalDto } from './dto/approval.dto';
import { SettingDto } from './dto/setting.dto';
import { Registration } from '@coolestprojects/database';
import { User } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
export declare class AppService {
    private readonly tshirtGroupModel;
    private readonly questionModel;
    private readonly eventModel;
    private readonly registrationModel;
    private readonly userModel;
    private readonly projectModel;
    constructor(tshirtGroupModel: typeof TshirtGroup, questionModel: typeof Question, eventModel: typeof Event, registrationModel: typeof Registration, userModel: typeof User, projectModel: typeof Project);
    findAllQuestions(info: InfoDto): Promise<QuestionDto[]>;
    findAllApprovals(info: InfoDto): Promise<ApprovalDto[]>;
    findAllTshirts(info: InfoDto): Promise<TshirtGroupDto[]>;
    getSettings(info: InfoDto): Promise<SettingDto>;
}
