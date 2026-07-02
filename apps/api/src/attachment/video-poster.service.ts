import { Injectable } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { AzureBlobService } from '../azureblob/azureblob.service';

const execFileAsync = promisify(execFile);

@Injectable()
export class VideoPosterService {
  constructor(private readonly azureBlobService: AzureBlobService) {}

  async ensurePoster(
    blobName: string,
    containerName: string,
  ): Promise<string | null> {
    const posterName = `${blobName}.poster.jpg`;
    const exists = await this.azureBlobService.checkBlobExists(
      posterName,
      containerName,
    );
    if (exists) {
      return posterName;
    }

    const workDir = join(tmpdir(), `cp-poster-${randomUUID()}`);
    await fs.mkdir(workDir, { recursive: true });
    const inputPath = join(workDir, blobName);
    const outputPath = join(workDir, posterName);

    try {
      await this.azureBlobService.downloadBlobToFile(
        blobName,
        containerName,
        inputPath,
      );
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        inputPath,
        '-ss',
        '1',
        '-vframes',
        '1',
        outputPath,
      ]);
      await this.azureBlobService.uploadFileToBlob(
        posterName,
        containerName,
        outputPath,
        'image/jpeg',
      );
      return posterName;
    }
    catch {
      return null;
    }
    finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }

  async normalizeVideo(
    blobName: string,
    containerName: string,
  ): Promise<number | null> {
    const workDir = join(tmpdir(), `cp-normalize-${randomUUID()}`);
    await fs.mkdir(workDir, { recursive: true });
    const inputPath = join(workDir, `input-${blobName}`);
    const outputPath = join(workDir, 'output.mp4');

    try {
      await this.azureBlobService.downloadBlobToFile(
        blobName,
        containerName,
        inputPath,
      );
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
        outputPath,
      ]);
      const outputStat = await fs.stat(outputPath);
      await this.azureBlobService.uploadFileToBlob(
        blobName,
        containerName,
        outputPath,
        'video/mp4',
      );
      return outputStat.size;
    }
    catch {
      return null;
    }
    finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }
}
