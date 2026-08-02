import { VoteCategory } from './votecategory.dto';


export class ProjectVoteDto {
    project_id!: number;
    title!: string;
    description!: string;
    language!: string;
    categories!: VoteCategory[];
    location!: string;
}