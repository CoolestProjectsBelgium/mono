import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureBlobService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );

    //this.blobServiceClient =
    //  BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadStreamToAzure(
    containerName: string,
    fileStream: Readable,
    blobName: string,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 20);
    return blockBlobClient.url;
  }
}
