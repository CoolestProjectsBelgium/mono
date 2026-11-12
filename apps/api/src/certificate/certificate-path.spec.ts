import * as path from 'node:path';
import {
  getCertificateAssetsDir,
  resolveCertificateAssetFilePath,
  resolveCertificateFilePath,
  sanitizeCertificateAssetFilename,
  sanitizeCertificateFilename,
} from './certificate-path';

const UNSAFE = [
  '../cert.pdf',
  '..\\cert.pdf',
  'a/cert.pdf',
  'a\\cert.pdf',
  'cert..pdf',
  '',
  '.pdf',
  'cert.pdf.exe',
  'cert name.pdf',
];

describe('certificate paths', () => {
  const previousRoot = process.env.UPLOAD_ROOT;
  beforeEach(() => {
    process.env.UPLOAD_ROOT = '/data/uploads';
  });
  afterAll(() => {
    if (previousRoot === undefined) delete process.env.UPLOAD_ROOT;
    else process.env.UPLOAD_ROOT = previousRoot;
  });

  it('accepts only pdf filenames for rendered certificates', () => {
    expect(sanitizeCertificateFilename('cert-12.pdf')).toBe('cert-12.pdf');
    expect(sanitizeCertificateFilename('CERT.PDF')).toBe('CERT.PDF');
    expect(sanitizeCertificateFilename('cert.png')).toBeNull();
  });

  it.each(UNSAFE)('rejects certificate filename %j', (name) => {
    expect(sanitizeCertificateFilename(name)).toBeNull();
    expect(resolveCertificateFilePath(5, name)).toBeNull();
  });

  it('accepts image assets but not pdfs or traversal', () => {
    expect(sanitizeCertificateAssetFilename('logo.svg')).toBe('logo.svg');
    expect(sanitizeCertificateAssetFilename('bg.webp')).toBe('bg.webp');
    expect(sanitizeCertificateAssetFilename('cert.pdf')).toBeNull();
    expect(resolveCertificateAssetFilePath(5, '../logo.svg')).toBeNull();
  });

  it('scopes files to the event directory under UPLOAD_ROOT', () => {
    expect(resolveCertificateFilePath(5, 'cert-12.pdf')).toBe(
      path.join('/data/uploads', 'certificates', '5', 'cert-12.pdf'),
    );
    expect(getCertificateAssetsDir(5)).toBe(
      path.join('/data/uploads', 'certificates', '5', 'assets'),
    );
    expect(resolveCertificateAssetFilePath(5, 'logo.svg')).toBe(
      path.join('/data/uploads', 'certificates', '5', 'assets', 'logo.svg'),
    );
  });
});
