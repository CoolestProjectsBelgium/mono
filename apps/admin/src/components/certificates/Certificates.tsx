import React, { useEffect, useRef, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Badge,
  Box,
  Button,
  H2,
  H3,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
  TextArea,
} from '@adminjs/design-system';
import type {
  CertificateAssetListItem,
  CertificateProjectRecord,
  CertificatesPageData,
  CertificateTemplateRecord,
} from './handler.js';

const api = new ApiClient();

interface ParticipantStatus {
  userId: number;
  projectId: number;
  userName: string;
  projectName: string;
  isOwner: boolean;
  language: string;
  certificateText: string;
  awardWon: boolean;
  awardCategoryName: string | null;
  hasTemplate: boolean;
  upToDate: boolean;
  generatedAt: string | null;
}

function apiBaseUrl(): string {
  return window.location.origin;
}

export const Certificates: React.FC = () => {
  const [data, setData] = useState<CertificatesPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('nl');
  const [templateBody, setTemplateBody] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [assets, setAssets] = useState<CertificateAssetListItem[]>([]);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [busyAsset, setBusyAsset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [projectDrafts, setProjectDrafts] = useState<Record<number, string>>(
    {},
  );
  const [savingProject, setSavingProject] = useState<number | null>(null);

  const [statuses, setStatuses] = useState<ParticipantStatus[] | null>(null);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const response = await api.getPage({ pageName: 'Certificates' });
      const pageData = response.data as CertificatesPageData;
      setData(pageData);
      setProjectDrafts(
        Object.fromEntries(
          pageData.projects.map((project) => [project.projectId, project.text]),
        ),
      );
      setError(null);
    } catch (err) {
      console.error('Failed to load certificates page:', err);
      setError('Unable to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: { action: 'list-assets' },
      });
      setAssets((response.data as { assets: CertificateAssetListItem[] }).assets);
    } catch (err) {
      console.error('Failed to load certificate assets:', err);
    }
  };

  const loadStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: { action: 'status' },
      });
      setStatuses(response.data as ParticipantStatus[]);
    } catch (err) {
      console.error('Failed to load certificate status:', err);
      setError('Unable to load participant status from the API.');
    } finally {
      setLoadingStatuses(false);
    }
  };

  useEffect(() => {
    loadAll();
    loadAssets();
    loadStatuses();
  }, []);

  useEffect(() => {
    const template = data?.templates.find(
      (candidate) => candidate.language === selectedLanguage,
    );
    setTemplateBody(template?.bodyHtml ?? '');
  }, [selectedLanguage, data]);

  const currentTemplate: CertificateTemplateRecord | undefined =
    data?.templates.find((candidate) => candidate.language === selectedLanguage);

  const handleSyncFromAwards = async () => {
    setLoading(true);
    try {
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: { action: 'sync-from-awards' },
      });
      const pageData = response.data as CertificatesPageData;
      setData(pageData);
      setProjectDrafts(
        Object.fromEntries(
          pageData.projects.map((project) => [project.projectId, project.text]),
        ),
      );
    } catch (err) {
      console.error('Failed to sync certificates from awards:', err);
      setError('Unable to sync from awards.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    setError(null);
    try {
      if (currentTemplate) {
        await api.recordAction({
          resourceId: 'CertificateTemplates',
          actionName: 'edit',
          recordId: String(currentTemplate.id),
          data: { bodyHtml: templateBody },
        });
      } else {
        await api.resourceAction({
          resourceId: 'CertificateTemplates',
          actionName: 'new',
          data: { language: selectedLanguage, bodyHtml: templateBody },
        });
      }
      await loadAll();
      await loadStatuses();
    } catch (err) {
      console.error('Failed to save certificate template:', err);
      setError('Unable to save the template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleUploadAsset = async (file: File) => {
    setUploadingAsset(true);
    try {
      const formData = new FormData();
      formData.append('action', 'upload-asset');
      formData.append('file', file, file.name);
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: formData,
      });
      setAssets((response.data as { assets: CertificateAssetListItem[] }).assets);
    } catch (err) {
      console.error('Failed to upload certificate asset:', err);
      setError('Unable to upload the asset.');
    } finally {
      setUploadingAsset(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAsset = async (filename: string) => {
    if (!window.confirm(`Delete "${filename}"?`)) {
      return;
    }
    setBusyAsset(filename);
    try {
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: { action: 'delete-asset', filename },
      });
      setAssets((response.data as { assets: CertificateAssetListItem[] }).assets);
    } catch (err) {
      console.error('Failed to delete certificate asset:', err);
      setError('Unable to delete the asset.');
    } finally {
      setBusyAsset(null);
    }
  };

  const handleSaveProjectText = async (project: CertificateProjectRecord) => {
    setSavingProject(project.projectId);
    try {
      const text = projectDrafts[project.projectId] ?? project.text;
      if (project.certificateId) {
        await api.recordAction({
          resourceId: 'Certificates',
          actionName: 'edit',
          recordId: String(project.certificateId),
          data: { text },
        });
      } else {
        // No Certificate row yet (project has no Award row to sync from) —
        // create one directly for this project.
        await api.resourceAction({
          resourceId: 'Certificates',
          actionName: 'new',
          data: { projectId: project.projectId, text },
        });
      }
      await loadAll();
      await loadStatuses();
    } catch (err) {
      console.error('Failed to save certificate text:', err);
      setError('Unable to save this project’s certificate text.');
    } finally {
      setSavingProject(null);
    }
  };

  const handleResetProjectText = async (project: CertificateProjectRecord) => {
    setSavingProject(project.projectId);
    try {
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: { action: 'reset-project-text', projectId: project.projectId },
      });
      const pageData = response.data as CertificatesPageData;
      setData(pageData);
      setProjectDrafts((prev) => ({
        ...prev,
        [project.projectId]:
          pageData.projects.find((p) => p.projectId === project.projectId)
            ?.text ?? '',
      }));
    } catch (err) {
      console.error('Failed to reset certificate text:', err);
      setError('Unable to reset this project’s certificate text.');
    } finally {
      setSavingProject(null);
    }
  };

  const handlePreview = async (status: ParticipantStatus) => {
    const key = `${status.projectId}-${status.userId}`;
    setPreviewKey(key);
    setPreviewPdf(null);
    try {
      const response = await api.getPage({
        pageName: 'Certificates',
        method: 'post',
        data: {
          action: 'preview',
          projectId: status.projectId,
          userId: status.userId,
          bodyHtml:
            data?.templates.find((t) => t.language === status.language)
              ?.bodyHtml ?? '',
          text: status.certificateText,
        },
      });
      setPreviewPdf((response.data as { pdfBase64: string }).pdfBase64);
    } catch (err) {
      console.error('Failed to render certificate preview:', err);
      setError('Unable to render a preview for this participant.');
      setPreviewKey(null);
    }
  };

  if (loading || !data) {
    return (
      <Box padding="xl">
        <Text>Loading certificates...</Text>
      </Box>
    );
  }

  return (
    <Box padding="xl">
      <H2>Certificates</H2>
      {error && (
        <Text color="danger" mb="lg">
          {error}
        </Text>
      )}

      {/* (a) Master template editor */}
      <Box bg="white" boxShadow="card" p="lg" mb="xxl">
        <H3>Template</H3>
        <Text color="grey60" mb="lg">
          One shared HTML layout per language, rendered as a PDF for every
          participant. Available merge fields: <code>{'{{participant.firstname}}'}</code>,{' '}
          <code>{'{{participant.lastname}}'}</code>,{' '}
          <code>{'{{project.name}}'}</code>, <code>{'{{event.eventTitle}}'}</code>,{' '}
          <code>{'{{certificate.text}}'}</code>,{' '}
          <code>{'{{#if award.won}}...{{award.categoryName}}...{{/if}}'}</code>,
          and an uploaded asset via{' '}
          <code>{"{{lookup assets 'logo.png'}}"}</code>.
        </Text>

        <Box mb="default" style={{ maxWidth: '200px' }}>
          <Label>Language</Label>
          <Select
            value={{ value: selectedLanguage, label: selectedLanguage.toUpperCase() }}
            options={data.languages.map((language) => ({
              value: language,
              label: language.toUpperCase(),
            }))}
            onChange={(option: { value: string } | null) =>
              setSelectedLanguage(option?.value ?? 'nl')
            }
          />
        </Box>

        <Box mb="default">
          <Label>Body HTML</Label>
          <TextArea
            rows={16}
            width={1}
            value={templateBody}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setTemplateBody(event.target.value)
            }
          />
        </Box>

        <Button
          variant="primary"
          disabled={savingTemplate}
          onClick={handleSaveTemplate}
        >
          {savingTemplate ? 'Saving...' : 'Save template'}
        </Button>
      </Box>

      {/* (b) Assets */}
      <Box bg="white" boxShadow="card" p="lg" mb="xxl">
        <H3>Assets</H3>
        <Text color="grey60" mb="lg">
          Upload a logo, seal, or signature image for use in the template
          body via <code>{"{{lookup assets 'logo.png'}}"}</code>.
        </Text>

        <Box mb="lg">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg,.gif,image/*"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUploadAsset(file);
              }
            }}
          />
          {uploadingAsset && <Text mt="default">Uploading...</Text>}
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.filename}>
                <TableCell>{asset.filename}</TableCell>
                <TableCell>
                  {new Date(asset.uploadedAt).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyAsset === asset.filename}
                    onClick={() => handleDeleteAsset(asset.filename)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {assets.length === 0 && <Text mt="lg">No assets uploaded yet.</Text>}
      </Box>

      {/* (c) Per-project text review */}
      <Box bg="white" boxShadow="card" p="lg" mb="xxl">
        <Box flex alignItems="center" style={{ gap: '16px' }} mb="lg">
          <H3 mb={0}>Per-project text</H3>
          <Button size="sm" onClick={handleSyncFromAwards} disabled={loading}>
            Sync from awards
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Award</TableCell>
              <TableCell>Certificate text</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.projects.map((project) => (
              <TableRow key={project.projectId}>
                <TableCell>{project.projectName}</TableCell>
                <TableCell>
                  {project.awardWon ? (
                    <Badge variant="success">
                      {project.awardCategoryName ?? 'Winner'}
                    </Badge>
                  ) : (
                    <Text color="grey60" fontSize="sm">
                      —
                    </Text>
                  )}
                </TableCell>
                <TableCell style={{ minWidth: '320px' }}>
                  <TextArea
                    rows={3}
                    width={1}
                    value={projectDrafts[project.projectId] ?? ''}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setProjectDrafts((prev) => ({
                        ...prev,
                        [project.projectId]: event.target.value,
                      }))
                    }
                  />
                  {project.isManual && (
                    <Text fontSize="xs" color="grey60" mt="sm">
                      Manually edited
                    </Text>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box flex flexDirection="column" style={{ gap: '8px' }}>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={savingProject === project.projectId}
                      onClick={() => handleSaveProjectText(project)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      outline
                      disabled={savingProject === project.projectId}
                      onClick={() => handleResetProjectText(project)}
                    >
                      Reset to award text
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* (d) Per-participant preview + download */}
      <Box bg="white" boxShadow="card" p="lg" mb="xl">
        <Box flex alignItems="center" style={{ gap: '16px' }} mb="lg">
          <H3 mb={0}>Participants</H3>
          <Button size="sm" onClick={loadStatuses} disabled={loadingStatuses}>
            {loadingStatuses ? 'Refreshing...' : 'Refresh status'}
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Participant</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Award</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {(statuses ?? []).map((status) => {
              const key = `${status.projectId}-${status.userId}`;
              return (
                <TableRow key={key}>
                  <TableCell>
                    {status.userName}
                    {status.isOwner && (
                      <Text as="span" fontSize="xs" color="grey60" ml="sm">
                        (owner)
                      </Text>
                    )}
                  </TableCell>
                  <TableCell>{status.projectName}</TableCell>
                  <TableCell>
                    {status.awardWon ? (
                      <Badge variant="success">
                        {status.awardCategoryName ?? 'Winner'}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {!status.hasTemplate ? (
                      <Badge variant="danger">No template</Badge>
                    ) : status.upToDate ? (
                      <Badge variant="success">
                        Generated{' '}
                        {status.generatedAt
                          ? new Date(status.generatedAt).toLocaleString()
                          : ''}
                      </Badge>
                    ) : (
                      <Badge variant="default">Not generated</Badge>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box flex justifyContent="flex-end" style={{ gap: '8px' }}>
                      <Button
                        size="sm"
                        disabled={!status.hasTemplate}
                        onClick={() => handlePreview(status)}
                      >
                        Preview
                      </Button>
                      <Button
                        as="a"
                        size="sm"
                        variant="primary"
                        disabled={!status.hasTemplate}
                        href={`${apiBaseUrl()}/admin/certificates/${status.projectId}/${status.userId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {(statuses ?? []).length === 0 && !loadingStatuses && (
          <Text mt="lg">No participants found for this event.</Text>
        )}
      </Box>

      {previewKey && (
        <Box bg="white" boxShadow="card" p="lg" mb="xl">
          <Box flex alignItems="center" justifyContent="space-between" mb="default">
            <H3 mb={0}>Preview</H3>
            <Button
              size="sm"
              onClick={() => {
                setPreviewKey(null);
                setPreviewPdf(null);
              }}
            >
              Close
            </Button>
          </Box>
          {previewPdf ? (
            <embed
              src={`data:application/pdf;base64,${previewPdf}`}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          ) : (
            <Text>Rendering preview...</Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Certificates;
