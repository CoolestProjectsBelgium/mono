import { Attachment } from './attachment.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Hyperlink extends BaseEventModel {
    href: string;
    attachment: Attachment;
    attachmentId: number;
}
