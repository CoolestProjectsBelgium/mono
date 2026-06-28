import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
export declare class AzureBlobService {
    private readonly configService;
    private readonly blobServiceClient;
    private readonly containerName;
    constructor(configService: ConfigService);
    uploadStreamToAzure(containerName: string, fileStream: Readable, blobName: string): Promise<string>;
}
