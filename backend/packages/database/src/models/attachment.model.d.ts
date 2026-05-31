import { AzureBlob } from './azure_blob.model.js';
import { Hyperlink } from './hyperlink.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Attachment extends BaseEventModel {
    projectId: number;
    confirmed: boolean;
    internal: boolean;
    filename: string;
    name: string;
    azureBlob: AzureBlob;
    hyperlink: Hyperlink;
}
