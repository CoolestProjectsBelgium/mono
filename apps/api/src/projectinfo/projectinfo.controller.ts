import { Project, Event } from '@coolestprojects/database';
import { Body, Controller, Delete, Get, HttpStatus, ParseFilePipeBuilder, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectDto } from '../dto/project.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { MulterFile } from '../file-upload/multer-file.type';
import { UserCookieInterceptor } from '../user-cookie.interceptor';
import { ProjectinfoService } from './projectinfo.service';
import { FileValidationInterceptor } from '../file-upload/file-validation.interceptor';
import { FileInterceptor } from '@nestjs/platform-express/multer';


@Controller('projectinfo')
@ApiTags('projectinfo')
@ApiCookieAuth()
export class ProjectinfoController {
  constructor(
    private projectService: ProjectinfoService,
    private fileUploadService: FileUploadService,
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(Event) private readonly eventModel: typeof Event
  ) { }

  @Get()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async getProject(@Request() req: any): Promise<ProjectDto> {
    return this.projectService.getProjectInfo(req.user.id);
  }

  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async createProject(
    @Request() req: any,
    @Body() createProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectService.createProject(req.user.id, createProjectDto);
  }

  @Patch()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async updateProject(
    @Request() req: any,
    @Body() updateProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectService.updateProject(req.user.id, updateProjectDto);
  }

  @Delete()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async deleteProject(@Request() req: any,): Promise<void> {
    return await this.projectService.deleteProject(req.user.id);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(
    FileInterceptor('file'),
    FileValidationInterceptor,
  )
  async uploadFile(
    @UploadedFile()
    file: MulterFile,
    @Request() req: any,
  ) {
    await this.fileUploadService.saveFile(
      req.user.id,
      file
    );
  }

}
