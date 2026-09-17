import { StreamableFile } from '@nestjs/common';

// puppeteer ships ESM-only; importing the real package would break Jest's
// CJS transform here even though this spec never renders anything — only
// `presentation.service.ts` (imported transitively via the controller)
// touches it.
jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));

import { PresentationController } from './presentation.controller';
import { PresentationService } from './presentation.service';

describe('PresentationController', () => {
  let controller: PresentationController;
  const presentationService = {
    listSlides: jest.fn(),
    getSlideImage: jest.fn(),
    getSlideMeta: jest.fn(),
    recordCheckin: jest.fn(),
    getAllowedResolutions: jest.fn(),
  };

  function fakeResponse() {
    return {
      status: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as import('express').Response;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PresentationController(
      presentationService as unknown as PresentationService,
    );
  });

  it('delegates the list route to the service with the current event', async () => {
    const list = { slides: [], hash: 'abc' };
    presentationService.listSlides.mockResolvedValue(list);

    const result = await controller.listSlides({ currentEvent: 1 } as never);

    expect(presentationService.listSlides).toHaveBeenCalledWith(1, undefined);
    expect(result).toBe(list);
  });

  it('passes a requested resolution through to the service', async () => {
    presentationService.listSlides.mockResolvedValue({ slides: [], hash: 'abc' });

    await controller.listSlides({ currentEvent: 1 } as never, '1280x720');

    expect(presentationService.listSlides).toHaveBeenCalledWith(1, '1280x720');
  });

  describe('getAllowedResolutions', () => {
    it('returns the service list plus the default key', () => {
      presentationService.getAllowedResolutions.mockReturnValue([
        { key: '1280x720', width: 1280, height: 720 },
        { key: '1920x1080', width: 1920, height: 1080 },
      ]);

      const result = controller.getAllowedResolutions();

      expect(result).toEqual({
        resolutions: [
          { key: '1280x720', width: 1280, height: 720 },
          { key: '1920x1080', width: 1920, height: 1080 },
        ],
        default: '1920x1080',
      });
    });
  });

  describe('heartbeat', () => {
    it('records a check-in for the authenticated account and its IP', async () => {
      await controller.heartbeat({
        user: { id: 7 },
        ip: '203.0.113.5',
      } as never);

      expect(presentationService.recordCheckin).toHaveBeenCalledWith(
        7,
        '203.0.113.5',
      );
    });

    it('falls back to an empty string when the request has no IP', async () => {
      await controller.heartbeat({
        user: { id: 7 },
        ip: undefined,
      } as never);

      expect(presentationService.recordCheckin).toHaveBeenCalledWith(7, '');
    });
  });

  describe('getSlideImage', () => {
    it('sets ETag/Last-Modified and returns the file on a normal request', async () => {
      const file = new StreamableFile(Buffer.from('png'));
      const generatedAt = new Date('2026-01-01T00:00:00.000Z');
      presentationService.getSlideImage.mockResolvedValue({
        file,
        hash: 'abc123',
        generatedAt,
      });
      const res = fakeResponse();

      const result = await controller.getSlideImage(
        { currentEvent: 1 } as never,
        'slide-1',
        { headers: {} } as never,
        res,
        '1280x720',
      );

      expect(result).toBe(file);
      expect(presentationService.getSlideImage).toHaveBeenCalledWith(
        1,
        'slide-1',
        '1280x720',
      );
      expect(res.setHeader).toHaveBeenCalledWith('ETag', '"abc123"');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Last-Modified',
        generatedAt.toUTCString(),
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 304 and skips headers when If-None-Match already matches', async () => {
      const file = new StreamableFile(Buffer.from('png'));
      const generatedAt = new Date();
      presentationService.getSlideImage.mockResolvedValue({
        file,
        hash: 'abc123',
        generatedAt,
      });
      const res = fakeResponse();

      const result = await controller.getSlideImage(
        { currentEvent: 1 } as never,
        'slide-1',
        { headers: { 'if-none-match': '"abc123"' } } as never,
        res,
      );

      expect(res.status).toHaveBeenCalledWith(304);
      expect(result).toBeUndefined();
    });
  });

  describe('getSlideMeta (HEAD)', () => {
    it('sets ETag/Last-Modified without calling the image-generating path', async () => {
      const generatedAt = new Date('2026-01-01T00:00:00.000Z');
      presentationService.getSlideMeta.mockResolvedValue({
        hash: 'abc123',
        generatedAt,
      });
      const res = fakeResponse();

      await controller.getSlideMeta(
        { currentEvent: 1 } as never,
        'slide-1',
        res,
        '1280x720',
      );

      expect(presentationService.getSlideMeta).toHaveBeenCalledWith(
        1,
        'slide-1',
        '1280x720',
      );
      expect(presentationService.getSlideImage).not.toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('ETag', '"abc123"');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Last-Modified',
        generatedAt.toUTCString(),
      );
    });

    it('omits Last-Modified when the slide has never been generated', async () => {
      presentationService.getSlideMeta.mockResolvedValue({
        hash: 'abc123',
        generatedAt: null,
      });
      const res = fakeResponse();

      await controller.getSlideMeta(
        { currentEvent: 1 } as never,
        'slide-1',
        res,
      );

      expect(res.setHeader).toHaveBeenCalledWith('ETag', '"abc123"');
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Last-Modified',
        expect.anything(),
      );
    });
  });
});
