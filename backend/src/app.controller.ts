import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { TshirtGroupDto } from './dto/tshirt-group.dto';
import { QuestionDto } from './dto/question.dto';
import { ApprovalDto } from './dto/approval.dto';
import { SettingDto } from './dto/setting.dto';
import { Info } from './info.decorator';
import { InfoDto } from './dto/info.dto';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('tshirts')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  findAllTshirts(@Info() info: InfoDto): Promise<TshirtGroupDto[]> {
    return this.appService.findAllTshirts(info);
  }

  @Get('questions')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  findAllQuestions(@Info() info: InfoDto): Promise<QuestionDto[]> {
    return this.appService.findAllQuestions(info);
  }

  @Get('approvals')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  findAllApprovals(@Info() info: InfoDto): Promise<ApprovalDto[]> {
    return this.appService.findAllApprovals(info);
  }

  @Get('settings')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  getSettings(@Info() info: InfoDto): Promise<SettingDto> {
    return this.appService.getSettings(info);
  }
}
