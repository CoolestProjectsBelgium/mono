export class MailTemplateContextRequestDto {
  recordType!: 'user' | 'registration';
  recordId?: number;
}
