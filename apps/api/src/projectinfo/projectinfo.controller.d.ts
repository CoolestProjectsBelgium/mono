import { ProjectDto } from '../dto/project.dto';
import { ProjectinfoService } from './projectinfo.service';
export declare class ProjectinfoController {
    private projectService;
    constructor(projectService: ProjectinfoService);
    getProject(req: any): Promise<ProjectDto>;
    createProject(req: any, createProjectDto: ProjectDto): Promise<ProjectDto>;
    updateProject(req: any, updateProjectDto: ProjectDto): Promise<ProjectDto>;
    deleteProject(req: any): Promise<void>;
}
