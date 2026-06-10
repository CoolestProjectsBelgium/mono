import { Injectable } from '@nestjs/common';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureBlobService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  private async getBlobServiceInstance() {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    return blobServiceClient;
  }

  private async getBlobClient(imageName: string, containerName: string): Promise<BlockBlobClient> {
        const blobService = await this.getBlobServiceInstance(); 
        const containerClient = blobService.getContainerClient(containerName); 
        const blockBlobClient = containerClient.getBlockBlobClient(imageName); 

        return blockBlobClient; 
    } 

  async uploadStreamToAzure(
    containerName: string,
    fileStream: Readable,
    blobName: string,
  ): Promise<string> {
    const blockBlobClient = await this.getBlobClient(blobName, containerName);
    await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 20);
    return blockBlobClient.url;
  }
}
