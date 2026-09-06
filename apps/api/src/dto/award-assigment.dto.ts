import { AwardCandidateDto } from "./award-candidate.dto";

export class AwardAssignmentDto {
    id!: number;
    categoryId!: number | null;
    categoryName?: string;
    projectId!: number;
    projectName!: string;
    candidates!: AwardCandidateDto[];
}