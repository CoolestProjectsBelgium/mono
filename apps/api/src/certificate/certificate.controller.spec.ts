import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));

describe('CertificateController', () => {
  let controller: CertificateController;
  const certificateService = {
    listParticipantStatus: jest.fn(),
    previewCertificateDraft: jest.fn(),
    getCertificatePdf: jest.fn(),
    listCertificateAssets: jest.fn(),
    uploadCertificateAsset: jest.fn(),
    deleteCertificateAsset: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateController],
      providers: [{ provide: CertificateService, useValue: certificateService }],
    })
      .overrideGuard(AuthGuard('mandatory-admin-cookie'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CertificateController>(CertificateController);
  });

  it('lists participant status for the logged-in event', async () => {
    const statuses = [{ userId: 1, projectId: 1 }];
    certificateService.listParticipantStatus.mockResolvedValue(statuses);

    const result = await controller.listStatus({
      user: { adminUser: { eventId: 6 } },
    });

    expect(certificateService.listParticipantStatus).toHaveBeenCalledWith(6);
    expect(result).toEqual(statuses);
  });

  it('rejects listStatus when no event is selected', () => {
    expect(() => controller.listStatus({ user: {} })).toThrow(
      BadRequestException,
    );
  });

  it('returns a base64-encoded preview PDF', async () => {
    certificateService.previewCertificateDraft.mockResolvedValue(
      Buffer.from('fake-pdf'),
    );

    const result = await controller.previewDraft(
      { user: { adminUser: { eventId: 6 } } },
      { projectId: 1, userId: 2, bodyHtml: '<p>x</p>', text: 'x' },
    );

    expect(certificateService.previewCertificateDraft).toHaveBeenCalledWith(6, {
      projectId: 1,
      userId: 2,
      bodyHtml: '<p>x</p>',
      text: 'x',
    });
    expect(result).toEqual({ pdfBase64: Buffer.from('fake-pdf').toString('base64') });
  });

  it('streams a certificate PDF with cache headers', async () => {
    const generatedAt = new Date('2026-01-01T00:00:00.000Z');
    const file = { fake: 'streamable-file' };
    certificateService.getCertificatePdf.mockResolvedValue({
      file,
      hash: 'abc123',
      generatedAt,
    });
    const res = { setHeader: jest.fn() };

    const result = await controller.getPdf(
      { user: { adminUser: { eventId: 6 } } },
      '1',
      '2',
      res as never,
    );

    expect(certificateService.getCertificatePdf).toHaveBeenCalledWith(6, 1, 2);
    expect(res.setHeader).toHaveBeenCalledWith('ETag', '"abc123"');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Last-Modified',
      generatedAt.toUTCString(),
    );
    expect(result).toBe(file);
  });

  it('lists certificate assets for the logged-in event', async () => {
    const overview = { assets: [{ filename: 'logo.png', uploadedAt: '2026-01-01' }] };
    certificateService.listCertificateAssets.mockResolvedValue(overview);

    const result = await controller.listAssets({
      user: { adminUser: { eventId: 6 } },
    });

    expect(certificateService.listCertificateAssets).toHaveBeenCalledWith(6);
    expect(result).toEqual(overview);
  });
});
