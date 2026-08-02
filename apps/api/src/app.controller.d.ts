import { AppService } from './app.service';
import { TshirtGroupDto } from './dto/tshirt-group.dto';
import { QuestionDto } from './dto/question.dto';
import { ApprovalDto } from './dto/approval.dto';
import { SettingDto } from './dto/setting.dto';
import { InfoDto } from './dto/info.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    findAllTshirts(info: InfoDto): Promise<TshirtGroupDto[]>;
    findAllQuestions(info: InfoDto): Promise<QuestionDto[]>;
    findAllApprovals(info: InfoDto): Promise<ApprovalDto[]>;
    getSettings(info: InfoDto): Promise<SettingDto>;
}
