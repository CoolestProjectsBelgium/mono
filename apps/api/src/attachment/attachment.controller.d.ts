import { AttachmentDto } from '../dto/attachment.dto';
import { SASToken } from '../dto/sas-token.dto';
export declare class AttachmentController {
    constructor();
    createAttachment(createAttachmentDto: AttachmentDto): Promise<SASToken | null>;
    createSASToken(name: any): Promise<SASToken | null>;
    deleteAttachment(name: any): Promise<any>;
}
