import { rewriteBlobUrlForClient } from './rewrite-blob-url';

describe('rewriteBlobUrlForClient', () => {
  it('returns the original URL when publicBase is unset', () => {
    const url =
      'http://azurite:10000/devstoreaccount1/container/blob.mp4?sv=2021&se=2026';
    expect(rewriteBlobUrlForClient(url, undefined)).toBe(url);
  });

  it('rewrites internal azurite URL to the public proxy base', () => {
    const url =
      'http://azurite:10000/devstoreaccount1/coolestproject25/uuid.mp4?sv=2021&se=2026';
    expect(
      rewriteBlobUrlForClient(
        url,
        'https://registration.coolestprojects.localhost:8443/_blob',
      ),
    ).toBe(
      'https://registration.coolestprojects.localhost:8443/_blob/devstoreaccount1/coolestproject25/uuid.mp4?sv=2021&se=2026',
    );
  });

  it('strips a trailing slash from publicBase', () => {
    const url = 'http://azurite:10000/devstoreaccount1/container/blob.mp4?sv=1';
    expect(
      rewriteBlobUrlForClient(
        url,
        'https://registration.coolestprojects.localhost:8443/_blob/',
      ),
    ).toBe(
      'https://registration.coolestprojects.localhost:8443/_blob/devstoreaccount1/container/blob.mp4?sv=1',
    );
  });
});
