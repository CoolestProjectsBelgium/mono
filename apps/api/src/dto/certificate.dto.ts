export class ParticipantCertificateStatusDto {
  userId!: number;
  projectId!: number;
  userName!: string;
  projectName!: string;
  isOwner!: boolean;
  language!: string;
  certificateText!: string;
  awardWon!: boolean;
  awardCategoryName!: string | null;
  hasTemplate!: boolean;
  upToDate!: boolean;
  generatedAt!: string | null;
}

export class PreviewCertificateDraftDto {
  projectId!: number;
  userId!: number;
  bodyHtml!: string;
  text!: string;
}

export class PreviewCertificateDraftResponseDto {
  pdfBase64!: string;
}

export class CertificateAssetListItemDto {
  filename!: string;
  uploadedAt!: string;
}

export class CertificateAssetsOverviewDto {
  assets!: CertificateAssetListItemDto[];
}
