import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { Registration, User } from '@coolestprojects/database';
import { AdminService } from './admin.service';
import { getFloorplanDir } from '../eventguide/floorplan-path';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('../eventguide/floorplan-path', () => ({
  ...jest.requireActual('../eventguide/floorplan-path'),
  getFloorplanDir: jest.fn(),
}));

describe('AdminService floorplans', () => {
  const eventModel = {
    findByPk: jest.fn(),
    update: jest.fn(),
  };
  const registrationModel = { findOne: jest.fn() };
  const userModel = { findOne: jest.fn() };
  const userProjectModel = { findOne: jest.fn() };
  const service = new AdminService(
    eventModel as never,
    registrationModel as never,
    userModel as never,
    userProjectModel as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.UPLOAD_ROOT = '/tmp/uploads';
    (getFloorplanDir as jest.Mock).mockReturnValue('/tmp/uploads/floorplans');
  });

  it('lists floorplans and marks the active event file', async () => {
    eventModel.findByPk.mockResolvedValue({ floorplanPath: 'cp2025_zaal.svg' });
    (readdir as jest.Mock).mockResolvedValue([
      { isFile: () => true, name: 'cp2025_zaal.svg' },
      { isFile: () => true, name: '../secret.svg' },
      { isFile: () => true, name: 'other.svg' },
    ]);
    (stat as jest.Mock).mockImplementation(async (filePath: string) => ({
      mtime: filePath.endsWith('other.svg')
        ? new Date('2026-01-02T00:00:00.000Z')
        : new Date('2026-01-01T00:00:00.000Z'),
    }));

    const result = await service.listFloorplans(1);

    expect(result.activeFilename).toBe('cp2025_zaal.svg');
    expect(result.floorplans).toHaveLength(2);
    expect(result.floorplans.find((item) => item.filename === 'cp2025_zaal.svg')?.isActive).toBe(true);
    expect(result.floorplans.find((item) => item.filename === 'other.svg')?.isActive).toBe(false);
  });

  it('uploads a processed SVG and activates it for the event', async () => {
    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g id="group1">
          <title>Tafel.1</title>
          <text>26.</text>
        </g>
      </svg>
    `;
    eventModel.findByPk.mockResolvedValue({ floorplanPath: 'grondplan-cp-2026.svg' });
    (readdir as jest.Mock).mockResolvedValue([{ isFile: () => true, name: 'map.svg' }]);
    (stat as jest.Mock).mockResolvedValue({ mtime: new Date('2026-01-01T00:00:00.000Z') });

    const result = await service.uploadFloorplan(1, {
      svgContent: svg,
      originalName: 'Grondplan CP 2026.svg',
    });

    expect(writeFile).toHaveBeenCalledWith(
      path.join('/tmp/uploads/floorplans', 'grondplan-cp-2026.svg'),
      expect.stringContaining('id="table_26"'),
      'utf8',
    );
    expect(eventModel.update).toHaveBeenCalledWith(
      { floorplanPath: 'grondplan-cp-2026.svg' },
      { where: { id: 1 } },
    );
    expect(result.activeFilename).toBe('grondplan-cp-2026.svg');
  });

  it('rejects corrupt SVG uploads', async () => {
    await expect(
      service.uploadFloorplan(1, {
        svgContent: '<text><g id="table_01"></g></text>',
        originalName: 'bad.svg',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('activates an existing floorplan file', async () => {
    eventModel.findByPk.mockResolvedValue({ floorplanPath: 'cp2025_zaal.svg' });
    (readdir as jest.Mock).mockResolvedValue([{ isFile: () => true, name: 'cp2025_zaal.svg' }]);
    (stat as jest.Mock).mockResolvedValue({ mtime: new Date('2026-01-01T00:00:00.000Z') });

    const result = await service.activateFloorplan(1, 'cp2025_zaal.svg');

    expect(eventModel.update).toHaveBeenCalledWith(
      { floorplanPath: 'cp2025_zaal.svg' },
      { where: { id: 1 } },
    );
    expect(result.floorplans[0]?.isActive).toBe(true);
  });

  it('rejects activating a missing floorplan file', async () => {
    (stat as jest.Mock).mockRejectedValue(new Error('ENOENT'));

    await expect(service.activateFloorplan(1, 'missing.svg')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('getMailTemplateContext', () => {
    const event = { id: 1, officialStartDate: new Date('2026-06-01') };

    /**
     * A real `User`/`Registration` instance (via prototype, no DB needed) — `buildMailContext`
     * tells the two apart with `instanceof`, so a plain object literal won't do. It also resolves
     * the Event through the record's own `getEvent()` association, so every fixture needs one.
     */
    function fakePerson<T extends object>(
      Ctor: { prototype: T },
      fields: Record<string, unknown>,
      resolvedEvent: unknown = event,
    ): T {
      return Object.assign(Object.create(Ctor.prototype), {
        getEvent: jest.fn().mockResolvedValue(resolvedEvent),
        ...fields,
      });
    }

    it('rejects when no record type is given', async () => {
      await expect(service.getMailTemplateContext({} as never)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(registrationModel.findOne).not.toHaveBeenCalled();
      expect(userModel.findOne).not.toHaveBeenCalled();
    });

    it('previews with the first record of the given kind when no record id is given', async () => {
      registrationModel.findOne.mockResolvedValue(fakePerson(Registration, {
        id: 3,
        eventId: 1,
        firstname: 'First',
        lastname: 'Registrant',
        email: 'first@test.be',
        email_guardian: null,
        language: 'nl',
      }));

      const context = await service.getMailTemplateContext({ recordType: 'registration' });

      expect(registrationModel.findOne).toHaveBeenCalledWith({ order: [['id', 'ASC']] });
      expect(context.registration).toEqual(expect.objectContaining({ firstname: 'First' }));
      expect(context.user).toBeUndefined();
    });

    it('rejects when no record of the given kind exists to preview with', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.getMailTemplateContext({ recordType: 'user' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('loads a real user and their owned project', async () => {
      userModel.findOne.mockResolvedValue(fakePerson(User, {
        id: 5,
        eventId: 1,
        firstname: 'Real',
        lastname: 'User',
        email: 'real@test.be',
        email_guardian: null,
        language: 'en',
      }));
      userProjectModel.findOne.mockResolvedValue({
        project: { id: 9, name: 'Real Project' },
      });

      const context = await service.getMailTemplateContext({
        recordType: 'user',
        recordId: 5,
      });

      expect(userModel.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(context.user).toEqual(expect.objectContaining({ firstname: 'Real' }));
      expect(context.project).toEqual({ id: 9, title: 'Real Project' });
      expect(context.token).toBeTruthy();
    });

    it('derives the event from the record\'s own association, not the admin\'s selected one', async () => {
      const pastEvent = { id: 7, officialStartDate: new Date('2024-06-01') };
      userModel.findOne.mockResolvedValue(fakePerson(User, {
        id: 5,
        eventId: 7,
        firstname: 'Past',
        lastname: 'Participant',
        email: 'past@test.be',
        email_guardian: null,
        language: 'en',
      }, pastEvent));
      userProjectModel.findOne.mockResolvedValue(null);

      // Admin is currently working the (unrelated) active event 1, but is
      // previewing e.g. a login mail for a participant of a past event.
      const context = await service.getMailTemplateContext({
        recordType: 'user',
        recordId: 5,
      });

      expect(context.year).toBe(2024);
    });

    it('rejects when the record\'s own event no longer exists', async () => {
      userModel.findOne.mockResolvedValue(fakePerson(User, {
        id: 5,
        eventId: 999,
        firstname: 'Orphan',
        lastname: 'Record',
        email: 'orphan@test.be',
        language: 'en',
      }, null));

      await expect(
        service.getMailTemplateContext({ recordType: 'user', recordId: 5 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('does not look up a project for a registration record', async () => {
      registrationModel.findOne.mockResolvedValue(fakePerson(Registration, {
        id: 3,
        eventId: 1,
        firstname: 'Reg',
        lastname: 'Istration',
        email: 'reg@test.be',
        email_guardian: 'parent@test.be',
        language: 'nl',
      }));

      const context = await service.getMailTemplateContext({
        recordType: 'registration',
        recordId: 3,
      });

      expect(context.registration).toEqual(expect.objectContaining({ firstname: 'Reg' }));
      expect(context.project).toBeUndefined();
      expect(userProjectModel.findOne).not.toHaveBeenCalled();
    });

    it('rejects an unknown record id', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.getMailTemplateContext({ recordType: 'user', recordId: 999 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
