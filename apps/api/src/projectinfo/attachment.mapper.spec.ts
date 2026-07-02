import { mapAttachmentRowToDto, inferAttachmentType } from './attachment.mapper';

describe('attachment.mapper', () => {
  describe('inferAttachmentType', () => {
    it('returns image for image extensions', () => {
      expect(inferAttachmentType('photo.png')).toBe('image');
      expect(inferAttachmentType('photo.jpg')).toBe('image');
    });

    it('returns movie for video extensions', () => {
      expect(inferAttachmentType('clip.mp4')).toBe('movie');
      expect(inferAttachmentType('clip.mov')).toBe('movie');
    });
  });

  describe('mapAttachmentRowToDto', () => {
    it('maps name and filename from plain row', () => {
      const dto = mapAttachmentRowToDto(
        {
          name: 'My label',
          filename: 'clip.mp4',
          confirmed: false,
          azureBlob: {
            blob_name: 'uuid.mp4',
            container_name: 'container',
            size: 1024,
          },
        } as never,
        { exists: true, url: 'https://example.test/uuid.mp4?sas=1' },
      );

      expect(dto).toEqual({
        id: 'uuid.mp4',
        name: 'My label',
        filename: 'clip.mp4',
        url: 'https://example.test/uuid.mp4?sas=1',
        size: 1024,
        confirmed: false,
        exists: true,
        type: 'movie',
      });
    });

    it('includes posterUrl when provided', () => {
      const dto = mapAttachmentRowToDto(
        {
          name: 'Video',
          filename: 'clip.mp4',
          confirmed: false,
          azureBlob: {
            blob_name: 'uuid.mp4',
            container_name: 'container',
            size: 2048,
            poster_blob_name: 'uuid.poster.jpg',
          },
        } as never,
        {
          exists: true,
          url: 'https://example.test/uuid.mp4',
          posterUrl: 'https://example.test/uuid.poster.jpg',
        },
      );

      expect(dto?.posterUrl).toBe('https://example.test/uuid.poster.jpg');
    });

    it('returns null when azure blob is missing', () => {
      expect(
        mapAttachmentRowToDto(
          { name: 'x', filename: 'x.png', confirmed: false } as never,
          { exists: false, url: null },
        ),
      ).toBeNull();
    });
  });
});
