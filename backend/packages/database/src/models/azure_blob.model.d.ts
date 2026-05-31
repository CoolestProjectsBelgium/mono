import { Attachment } from './attachment.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class AzureBlob extends BaseEventModel {
    container_name: string;
    blob_name: string;
    size: number;
    attachmentId: number;
    attachment: Attachment;
}
