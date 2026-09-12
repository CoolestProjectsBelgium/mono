import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));

describe('AdminController', () => {
  let controller: AdminController;
  const adminService = {
    listFloorplans: jest.fn(),
    uploadFloorplan: jest.fn(),
    activateFloorplan: jest.fn(),
    deleteFloorplan: jest.fn(),
    getMailTemplateContext: jest.fn(),
    uploadPresentationSlideImage: jest.fn(),
    listPresentationAssets: jest.fn(),
    uploadPresentationAsset: jest.fn(),
    deletePresentationAsset: jest.fn(),
    listPresentationSlides: jest.fn(),
    listPresentationPreviewProjects: jest.fn(),
    getPresentationSlideImage: jest.fn(),
    previewPresentationSlideDraft: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: adminService,
        },
      ],
    })
      .overrideGuard(AuthGuard('mandatory-admin-cookie'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('lists floorplans for the logged-in event', async () => {
    const overview = {
      floorplans: [
        {
          filename: 'cp2025_zaal.svg',
          uploadedAt: '2026-01-01T00:00:00.000Z',
          isActive: true,
        },
      ],
      activeFilename: 'cp2025_zaal.svg',
    };
    adminService.listFloorplans.mockResolvedValue(overview);

    const result = await controller.listFloorplans({
      user: { adminUser: { eventId: 1 } },
    });

    expect(adminService.listFloorplans).toHaveBeenCalledWith(1);
    expect(result).toEqual(overview);
  });

  it('rejects list when no event is selected', () => {
    expect(() =>
      controller.listFloorplans({ user: { adminUser: {} } }),
    ).toThrow(BadRequestException);
  });

  it('uploads a floorplan for the logged-in event', async () => {
    const file = {
      fieldname: 'file',
      originalname: 'map.svg',
      encoding: '7bit',
      mimetype: 'image/svg+xml',
      size: 9,
      buffer: Buffer.from('<svg></svg>'),
    };
    adminService.uploadFloorplan.mockResolvedValue({
      floorplans: [],
      activeFilename: null,
    });

    await controller.uploadFloorplan(
      { user: { adminUser: { eventId: 2 } } },
      file,
    );

    expect(adminService.uploadFloorplan).toHaveBeenCalledWith(2, file);
  });

  it('activates a floorplan for the logged-in event', async () => {
    adminService.activateFloorplan.mockResolvedValue({
      floorplans: [],
      activeFilename: 'map.svg',
    });

    await controller.activateFloorplan(
      { user: { adminUser: { eventId: 3 } } },
      'cp2025_zaal.svg',
    );

    expect(adminService.activateFloorplan).toHaveBeenCalledWith(
      3,
      'cp2025_zaal.svg',
    );
  });

  it('deletes a floorplan for the logged-in event', async () => {
    adminService.deleteFloorplan.mockResolvedValue({
      floorplans: [],
      activeFilename: null,
    });

    await controller.deleteFloorplan(
      { user: { adminUser: { eventId: 3 } } },
      'old-map.svg',
    );

    expect(adminService.deleteFloorplan).toHaveBeenCalledWith(3, 'old-map.svg');
  });

  it('fetches the mail template context', async () => {
    const context = { year: 2026, user: { firstname: 'Jan' } };
    adminService.getMailTemplateContext.mockResolvedValue(context);

    const body = { recordType: 'user' as const, recordId: 5 };
    const result = await controller.getMailTemplateContext(body);

    expect(adminService.getMailTemplateContext).toHaveBeenCalledWith(body);
    expect(result).toEqual(context);
  });

  it('uploads a presentation slide image for the logged-in event', async () => {
    const file = {
      fieldname: 'file',
      originalname: 'sponsor.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 4,
      buffer: Buffer.from('fake'),
    };

    await controller.uploadPresentationSlideImage(
      { user: { adminUser: { eventId: 4 } } },
      '7',
      file,
    );

    expect(adminService.uploadPresentationSlideImage).toHaveBeenCalledWith(
      4,
      7,
      file,
    );
  });

  it('lists presentation assets for the logged-in event', async () => {
    const overview = {
      assets: [
        { filename: 'logo.png', uploadedAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    adminService.listPresentationAssets.mockResolvedValue(overview);

    const result = await controller.listPresentationAssets({
      user: { adminUser: { eventId: 4 } },
    });

    expect(adminService.listPresentationAssets).toHaveBeenCalledWith(4);
    expect(result).toEqual(overview);
  });

  it('uploads a presentation asset for the logged-in event', async () => {
    const file = {
      fieldname: 'file',
      originalname: 'logo.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 4,
      buffer: Buffer.from('fake'),
    };
    adminService.uploadPresentationAsset.mockResolvedValue({ assets: [] });

    await controller.uploadPresentationAsset(
      { user: { adminUser: { eventId: 4 } } },
      file,
    );

    expect(adminService.uploadPresentationAsset).toHaveBeenCalledWith(4, file);
  });

  it('deletes a presentation asset for the logged-in event', async () => {
    adminService.deletePresentationAsset.mockResolvedValue({ assets: [] });

    await controller.deletePresentationAsset(
      { user: { adminUser: { eventId: 4 } } },
      'logo.png',
    );

    expect(adminService.deletePresentationAsset).toHaveBeenCalledWith(
      4,
      'logo.png',
    );
  });

  it('lists presentation slides for the logged-in event', async () => {
    const result = { slides: [], hash: 'abc' };
    adminService.listPresentationSlides.mockResolvedValue(result);

    const response = await controller.listPresentationSlides({
      user: { adminUser: { eventId: 6 } },
    });

    expect(adminService.listPresentationSlides).toHaveBeenCalledWith(6);
    expect(response).toEqual(result);
  });

  it('lists presentation preview projects for the logged-in event', async () => {
    const options = [{ id: 1, name: 'A project' }];
    adminService.listPresentationPreviewProjects.mockResolvedValue(options);

    const response = await controller.listPresentationPreviewProjects({
      user: { adminUser: { eventId: 6 } },
    });

    expect(adminService.listPresentationPreviewProjects).toHaveBeenCalledWith(
      6,
    );
    expect(response).toEqual(options);
  });

  it('streams a presentation slide preview image with cache headers', async () => {
    const generatedAt = new Date('2026-01-01T00:00:00.000Z');
    const file = { fake: 'streamable-file' };
    adminService.getPresentationSlideImage.mockResolvedValue({
      file,
      hash: 'abc123',
      generatedAt,
    });
    const res = { setHeader: jest.fn() };

    const result = await controller.getPresentationSlideImage(
      { user: { adminUser: { eventId: 6 } } },
      'slide-1',
      res as never,
    );

    expect(adminService.getPresentationSlideImage).toHaveBeenCalledWith(
      6,
      'slide-1',
    );
    expect(res.setHeader).toHaveBeenCalledWith('ETag', '"abc123"');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Last-Modified',
      generatedAt.toUTCString(),
    );
    expect(result).toBe(file);
  });

  it('renders an unsaved presentation slide draft', async () => {
    const body = { slideId: 5, body: '<h1>x</h1>' };
    adminService.previewPresentationSlideDraft.mockResolvedValue({
      imageBase64: 'ZmFrZQ==',
    });

    const result = await controller.previewPresentationSlideDraft(
      { user: { adminUser: { eventId: 6 } } },
      body,
    );

    expect(adminService.previewPresentationSlideDraft).toHaveBeenCalledWith(
      6,
      body,
    );
    expect(result).toEqual({ imageBase64: 'ZmFrZQ==' });
  });
});
