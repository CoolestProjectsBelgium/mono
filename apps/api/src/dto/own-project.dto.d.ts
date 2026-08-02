import { ParticipantDto } from './participant.dto';
import { AttachmentDto } from './attachment.dto';
export declare class OwnProjectDto {
    project_id?: string;
    project_name: string;
    project_descr: string;
    project_type: string;
    project_lang: string;
    participants?: ParticipantDto[];
    attachments?: AttachmentDto[];
    delete_possible?: boolean;
}
