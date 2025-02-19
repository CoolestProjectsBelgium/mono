import { Controller, Get, Body, Post, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { ProjectDto } from '../dto/project.dto';

@Controller('projectinfo')
@ApiTags('projectinfo')
@ApiCookieAuth()
export class ProjectinfoController {
  @Get()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getProject(): Promise<ProjectDto> {
    return null;
  }

  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createProject(
    @Body() createProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    return null;
  }

  @Patch()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateProject(
    @Body() updateProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    return null;
  }

  @Delete()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteProject() {
    return null;
  }
}
