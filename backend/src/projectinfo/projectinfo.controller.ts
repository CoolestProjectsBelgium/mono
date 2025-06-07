import { Controller, Get, Body, Post, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { ProjectDto } from '../dto/project.dto';
import { AuthGuard } from '@nestjs/passport';
import { ProjectinfoService } from '../projectinfo/projectinfo.service';

@Controller('projectinfo')
@ApiTags('projectinfo')
@ApiCookieAuth()
export class ProjectinfoController {
  constructor(private projectService: ProjectinfoService) {}

  @Get()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt'))
  async getProject(@Request() req): Promise<ProjectDto> {
    return this.projectService.getProjectInfo(req.user.id); 
  }

  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt'))
  async createProject(
    @Request() req,
    @Body() createProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectService.createProject(req.user.id, createProjectDto);
  }

  @Patch()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt'))
  async updateProject(
    @Request() req,
    @Body() updateProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectService.updateProject(req.user.id, updateProjectDto);
  }

  @Delete()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt'))
  async deleteProject(@Request() req,): Promise<void> {
    return await this.projectService.deleteProject(req.user.id,);
  }
}
