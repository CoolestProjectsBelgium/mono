import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  const adminService = {
    listFloorplans: jest.fn(),
    uploadFloorplan: jest.fn(),
    activateFloorplan: jest.fn(),
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
      floorplans: [{ filename: 'cp2025_zaal.svg', uploadedAt: '2026-01-01T00:00:00.000Z', isActive: true }],
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
    const body = { svgContent: '<svg></svg>', originalName: 'map.svg' };
    adminService.uploadFloorplan.mockResolvedValue({ floorplans: [], activeFilename: null });

    await controller.uploadFloorplan({ user: { adminUser: { eventId: 2 } } }, body);

    expect(adminService.uploadFloorplan).toHaveBeenCalledWith(2, body);
  });

  it('activates a floorplan for the logged-in event', async () => {
    adminService.activateFloorplan.mockResolvedValue({ floorplans: [], activeFilename: 'map.svg' });

    await controller.activateFloorplan(
      { user: { adminUser: { eventId: 3 } } },
      'cp2025_zaal.svg',
    );

    expect(adminService.activateFloorplan).toHaveBeenCalledWith(3, 'cp2025_zaal.svg');
  });
});
