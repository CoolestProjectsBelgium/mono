import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  BlockBlobClient,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { SASToken } from '../dto/sas-token.dto';
import { rewriteBlobUrlForClient } from './rewrite-blob-url';

@Injectable()
export class AzureBlobService {
  constructor(private readonly configService: ConfigService) {}

  private getConnectionString(): string {
    return (
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING') ?? ''
    );
  }

  private getDefaultContainer(): string | undefined {
    return this.configService.get<string>('AZURE_STORAGE_CONTAINER');
  }

  private getPublicBaseUrl(): string | undefined {
    return this.configService.get<string>('AZURE_BLOB_PUBLIC_BASE_URL');
  }

  private rewriteUrlForClient(url: string): string {
    return rewriteBlobUrlForClient(url, this.getPublicBaseUrl());
  }

  private async getBlobServiceInstance(): Promise<BlobServiceClient> {
    return BlobServiceClient.fromConnectionString(this.getConnectionString());
  }

  private async getBlobClient(
    blobName: string,
    containerName: string,
  ): Promise<BlockBlobClient> {
    const blobService = await this.getBlobServiceInstance();
    const containerClient = blobService.getContainerClient(containerName);
    return containerClient.getBlockBlobClient(blobName);
  }

  async generateSAS(
    blobName: string,
    type: 'r' | 'w' = 'w',
    filename: string | null = null,
    containerName?: string,
  ): Promise<SASToken> {
    const container = containerName ?? this.getDefaultContainer();
    if (!container) {
      throw new Error('Azure storage container is not configured');
    }
    const blockBlobClient = await this.getBlobClient(blobName, container);

    const expiresOn = new Date(Date.now() + 86400 * 1000);
    const startsOn = new Date(Date.now() - 1000);

    const config: {
      permissions: BlobSASPermissions;
      expiresOn: Date;
      startsOn: Date;
      contentDisposition?: string;
    } = {
      permissions: BlobSASPermissions.parse(type),
      expiresOn,
      startsOn,
    };

    if (filename) {
      config.contentDisposition = `attachment; filename="${filename}"`;
    }

    const url = this.rewriteUrlForClient(
      await blockBlobClient.generateSasUrl(config),
    );

    return { url, expiresOn, startsOn };
  }

  async deleteBlob(blobName: string, containerName?: string): Promise<void> {
    const container = containerName ?? this.getDefaultContainer();
    if (!container) {
      throw new Error('Azure storage container is not configured');
    }
    const blockBlobClient = await this.getBlobClient(blobName, container);
    await blockBlobClient.deleteIfExists();
  }

  async checkBlobExists(
    blobName: string,
    containerName?: string,
  ): Promise<boolean> {
    const container = containerName ?? this.getDefaultContainer();
    if (!container) {
      return false;
    }
    const blockBlobClient = await this.getBlobClient(blobName, container);
    return blockBlobClient.exists();
  }

  async syncContainer(containerName?: string): Promise<void> {
    const container = containerName ?? this.getDefaultContainer();
    if (!container) {
      return;
    }
    const blobServiceClient = await this.getBlobServiceInstance();
    const containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.createIfNotExists();

    const frontendUrl = this.configService.get<string>('URL');
    const backendUrl = this.configService.get<string>('BACKENDURL');
    if (!frontendUrl && !backendUrl) {
      return;
    }

    const currentSettings = await blobServiceClient.getProperties();
    const corsRules = [...(currentSettings.cors ?? [])];

    if (frontendUrl) {
      corsRules.push({
        allowedOrigins: frontendUrl,
        allowedMethods: 'OPTIONS,PUT,POST,GET',
        allowedHeaders: '*',
        exposedHeaders: '*',
        maxAgeInSeconds: 7200,
      });
    }
    if (backendUrl) {
      corsRules.push({
        allowedOrigins: backendUrl,
        allowedMethods: 'OPTIONS,PUT,POST,GET',
        allowedHeaders: '*',
        exposedHeaders: '*',
        maxAgeInSeconds: 7200,
      });
    }

    await blobServiceClient.setProperties({ cors: corsRules });
  }
}
