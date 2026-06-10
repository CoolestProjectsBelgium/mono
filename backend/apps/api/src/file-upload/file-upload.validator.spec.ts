import { FileUploadValidator } from './file-upload.validator';

describe('FileUploadValidator', () => {
  it('should be defined', () => {
    expect(new FileUploadValidator({})).toBeDefined();
  });
});
