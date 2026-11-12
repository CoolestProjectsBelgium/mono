import * as path from 'node:path';
import {
  getPresentationAssetsDir,
  getPresentationDir,
  resolvePresentationAssetFilePath,
  resolvePresentationFilePath,
  sanitizePresentationAssetFilename,
  sanitizePresentationFilename,
} from './presentation-path';

const TRAVERSAL = [
  '../secret.png',
  '..\\secret.png',
  'a/b.png',
  'a\\b.png',
  '/etc/passwd',
  'slide..png',
  '',
  '.png',
  'slide.png.exe',
  'slide',
  'slide .png',
  'slide%2e%2e.png',
];

describe('presentation paths', () => {
  const previousRoot = process.env.UPLOAD_ROOT;
  beforeEach(() => {
    process.env.UPLOAD_ROOT = '/data/uploads';
  });
  afterAll(() => {
    if (previousRoot === undefined) delete process.env.UPLOAD_ROOT;
    else process.env.UPLOAD_ROOT = previousRoot;
  });

  it.each(['slide-1.png', 'Slide_2.JPG', 'a.b.jpeg', 'x.webp'])(
    'accepts slide filename %s',
    (name) => {
      expect(sanitizePresentationFilename(name)).toBe(name);
    },
  );

  it.each([...TRAVERSAL, 'logo.svg', 'anim.gif'])(
    'rejects slide filename %j',
    (name) => {
      expect(sanitizePresentationFilename(name)).toBeNull();
      expect(resolvePresentationFilePath(3, name)).toBeNull();
    },
  );

  it('additionally allows svg and gif for assets', () => {
    expect(sanitizePresentationAssetFilename('logo.svg')).toBe('logo.svg');
    expect(sanitizePresentationAssetFilename('anim.GIF')).toBe('anim.GIF');
  });

  it.each([...TRAVERSAL, 'notes.pdf'])('rejects asset filename %j', (name) => {
    expect(sanitizePresentationAssetFilename(name)).toBeNull();
    expect(resolvePresentationAssetFilePath(3, name)).toBeNull();
  });

  it('scopes files to the event directory under UPLOAD_ROOT', () => {
    expect(getPresentationDir(3)).toBe(
      path.join('/data/uploads', 'presentations', '3'),
    );
    expect(resolvePresentationFilePath(3, 'slide-1.png')).toBe(
      path.join('/data/uploads', 'presentations', '3', 'slide-1.png'),
    );
    expect(getPresentationAssetsDir(3)).toBe(
      path.join('/data/uploads', 'presentations', '3', 'assets'),
    );
    expect(resolvePresentationAssetFilePath(3, 'logo.svg')).toBe(
      path.join('/data/uploads', 'presentations', '3', 'assets', 'logo.svg'),
    );
  });

  it('refuses to build a path when UPLOAD_ROOT is not configured', () => {
    delete process.env.UPLOAD_ROOT;
    expect(() => getPresentationDir(3)).toThrow(/UPLOAD_ROOT/);
  });
});
