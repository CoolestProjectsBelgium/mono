import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MockInfoInterceptor } from './mock-info.interceptor';
import { AzureBlobService } from '../src/azureblob/azureblob.service';
import { TokensService } from '../src/tokens/tokens.service';
import { getModelToken } from '@nestjs/sequelize';
import { User, Project, Attachment, AzureBlob } from '@coolestprojects/database';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue({});
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe('Attachments (e2e)', () => {
  let app: INestApplication;
  let mockInterceptor: MockInfoInterceptor;
  let tokensService: TokensService;
  let userModel: typeof User;
  let projectModel: typeof Project;
  let azureBlobModel: typeof AzureBlob;

  const mockAzureBlobService = {
    generateSAS: jest.fn().mockImplementation((blobName: string) =>
      Promise.resolve({
        url: `https://example.blob/${blobName}?sas=token`,
        expiresOn: new Date(Date.now() + 86400000),
        startsOn: new Date(),
      }),
    ),
    syncContainer: jest.fn().mockResolvedValue(undefined),
    deleteBlob: jest.fn().mockResolvedValue(undefined),
    checkBlobExists: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    mockInterceptor = new MockInfoInterceptor({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: true,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(APP_INTERCEPTOR)
      .useValue(mockInterceptor)
      .overrideProvider(AzureBlobService)
      .useValue(mockAzureBlobService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tokensService = moduleFixture.get(TokensService);
    userModel = moduleFixture.get(getModelToken(User));
    projectModel = moduleFixture.get(getModelToken(Project));
    azureBlobModel = moduleFixture.get(getModelToken(AzureBlob));
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates attachment, lists it, refreshes SAS, and deletes it', async () => {
    const user = await userModel.create({
      email: 'attachment-test@test.be',
      firstname: 'Test',
      lastname: 'User',
      language: 'en',
      eventId: 1,
      postalcode: 1000,
      sex: 'x',
      tshirtId: 1,
    } as any);

    await projectModel.create({
      name: 'Attachment Project',
      description: 'desc',
      type: 'test',
      language: 'en',
      ownerId: user.id,
      eventId: 1,
    } as any);

    const token = tokensService.generateLoginToken(user.id);

    const createResponse = await request(app.getHttpServer())
      .post('/attachments')
      .set('Authorization', token)
      .send({ name: 'test movie', filename: 'test.mp4', size: 100 });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.url).toContain('example.blob');

    const blob = await azureBlobModel.findOne({
      include: [Attachment],
    });
    expect(blob).not.toBeNull();
    const blobName = blob!.getDataValue('blob_name');
    expect(createResponse.body.url).toContain(blobName);

    const sasResponse = await request(app.getHttpServer())
      .post(`/attachments/${blobName}/sas`)
      .set('Authorization', token);

    expect(sasResponse.status).toBe(201);
    expect(sasResponse.body.url).toContain(blobName);

    const projectinfoResponse = await request(app.getHttpServer())
      .get('/projectinfo')
      .set('Authorization', token);

    expect(projectinfoResponse.status).toBe(200);
    expect(projectinfoResponse.body.attachments).toHaveLength(1);
    expect(projectinfoResponse.body.attachments[0].exists).toBe(true);
    expect(projectinfoResponse.body.attachments[0].url).toContain(blobName);

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/attachments/${blobName}`)
      .set('Authorization', token);

    expect(deleteResponse.status).toBe(200);
    expect(mockAzureBlobService.deleteBlob).toHaveBeenCalled();

    const afterDelete = await request(app.getHttpServer())
      .get('/projectinfo')
      .set('Authorization', token);

    expect(afterDelete.body.attachments).toHaveLength(0);
  });
});