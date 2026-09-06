export class AwardCandidateDto {
    projectId!: number;
    projectName!: string;
    categoryId!: number;
    categoryName!: string;
    rank!: number;
    adjustedAveragePercent!: number;
    medianPercent!: number;
    minPercent!: number;
    maxPercent!: number;
    outlierCount!: number;
}