import { Project } from '@coolestprojects/database';
import { ProjectDto } from '../dto/project.dto';
import { Voucher } from '@coolestprojects/database';
export declare class ProjectinfoService {
    private readonly projectModel;
    private readonly voucherModel;
    constructor(projectModel: typeof Project, voucherModel: typeof Voucher);
    getProjectInfo(userId: number): Promise<ProjectDto>;
    createProject(userId: number, createProjectDto: ProjectDto): Promise<ProjectDto>;
    updateProject(userId: number, updateProjectDto: ProjectDto): Promise<ProjectDto>;
    deleteProject(userId: number): Promise<void>;
}
