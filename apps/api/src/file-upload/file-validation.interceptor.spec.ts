import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { Event } from '@coolestprojects/database';
import { of } from 'rxjs';
import { FileValidationInterceptor } from './file-validation.interceptor';

describe('FileValidationInterceptor', () => {
  const event = {
    maxFileSize: 1000,
    allowedMimeTypes: ['image/png', 'image/jpeg'],
  };
  const contextFor = (req: unknown) =>
    ({
      switchToHttp: () => ({ getRequest: () => req }),
    }) as unknown as ExecutionContext;

  let findByPk: ReturnType<typeof vi.fn>;
  let handle: ReturnType<typeof vi.fn>;
  let next: CallHandler;
  let interceptor: FileValidationInterceptor;

  beforeEach(() => {
    findByPk = vi.fn().mockResolvedValue({ event });
    handle = vi.fn().mockReturnValue(of('handled'));
    next = { handle } as unknown as CallHandler;
    interceptor = new FileValidationInterceptor({ findByPk } as never);
  });

  it('passes requests without a file straight through', async () => {
    await interceptor.intercept(contextFor({ user: { id: 1 } }), next);
    expect(handle).toHaveBeenCalledTimes(1);
    expect(findByPk).not.toHaveBeenCalled();
  });

  it("accepts a file within the event's size and type limits", async () => {
    const req = {
      user: { id: 7 },
      file: { size: 1000, mimetype: 'image/png' },
    };
    await interceptor.intercept(contextFor(req), next);
    expect(findByPk).toHaveBeenCalledWith(7, { include: [Event] });
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('rejects a file larger than the event allows', async () => {
    const req = {
      user: { id: 7 },
      file: { size: 1001, mimetype: 'image/png' },
    };
    await expect(interceptor.intercept(contextFor(req), next)).rejects.toThrow(
      /File too large. Max allowed is 1000 bytes/,
    );
    expect(handle).not.toHaveBeenCalled();
  });

  it('rejects a mime type the event does not allow', async () => {
    const req = {
      user: { id: 7 },
      file: { size: 10, mimetype: 'image/svg+xml' },
    };
    await expect(interceptor.intercept(contextFor(req), next)).rejects.toThrow(
      /Invalid file type: image\/svg\+xml/,
    );
    expect(handle).not.toHaveBeenCalled();
  });

  it('rejects an upload when the user cannot be found', async () => {
    findByPk.mockResolvedValue(null);
    const req = { user: { id: 7 }, file: { size: 10, mimetype: 'image/png' } };
    await expect(
      interceptor.intercept(contextFor(req), next),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(handle).not.toHaveBeenCalled();
  });
});
