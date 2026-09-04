import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  Button,
  FormGroup,
  H2,
  Input,
  Label,
  Select,
  Text,
  TextArea,
} from '@adminjs/design-system';
import type { EmailTemplateRecord } from './handler-helpers.js';
import { EMAIL_TEMPLATE_RESOURCE_ID } from './handler-helpers.js';
import type { EmailTemplatesPageData } from './handler.js';
import type { ContextRecordOption, ContextRecordsPageData } from './handler.js';
import { getContextRecordType, type ContextRecordType } from './handler-helpers.js';
import { prepareHtmlForSubmit, serializeHtmlEditor } from './format-html.js';
import type { HtmlLintWarning } from './format-html.js';
import type { PreviewResult } from './render-preview.js';

declare global {
  interface Window {
    tinymce?: {
      init: (config: Record<string, unknown>) => Promise<Array<{ getContent: () => string; setContent: (value: string) => void; remove: () => void }>>;
      get: (id: string) => { getContent: () => string; setContent: (value: string) => void } | null;
    };
  }
}

const api = new ApiClient();
const TINYMCE_SCRIPT = 'https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js';
const EDITOR_ID = 'email-template-rich';

const EmailTemplates: React.FC = () => {
  const [meta, setMeta] = useState<{ templates: string[]; languages: readonly string[] } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ value: string; label: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<{ value: string; label: string } | null>(null);
  const [subject, setSubject] = useState('');
  const [contentRich, setContentRich] = useState('');
  const [contentPlain, setContentPlain] = useState('');
  const [recordId, setRecordId] = useState<number | null>(null);
  const [contextRecordType, setContextRecordType] = useState<ContextRecordType>('user');
  const [contextRecords, setContextRecords] = useState<ContextRecordOption[]>([]);
  const [selectedContextRecord, setSelectedContextRecord] = useState<{ value: string; label: string } | null>(null);
  const [contextJson, setContextJson] = useState('');
  const [lintWarnings, setLintWarnings] = useState<HtmlLintWarning[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorReady = useRef(false);

  const templateOptions = meta?.templates.map((template) => ({
    value: template,
    label: template,
  })) ?? [];

  const languageOptions = meta?.languages.map((language) => ({
    value: language,
    label: language.toUpperCase(),
  })) ?? [];

  const syncEditorContent = (html: string) => {
    setContentRich(html);
    if (editorReady.current && window.tinymce) {
      window.tinymce.get(EDITOR_ID)?.setContent(html);
    }
  };

  const applyRecord = (record: EmailTemplateRecord | null) => {
    if (!record) {
      setSubject('');
      syncEditorContent('');
      setContentPlain('');
      setRecordId(null);
      return;
    }

    setSubject(record.subject);
    syncEditorContent(record.contentRich);
    setContentPlain(record.contentPlain);
    setRecordId(record.id);
    setSelectedTemplate({ value: record.template, label: record.template });
    setSelectedLanguage({ value: record.language, label: record.language.toUpperCase() });
  };

  const loadContextOptions = useCallback(async (template: string) => {
    const response = await api.getPage({
      pageName: 'EmailTemplates',
      method: 'post',
      data: { action: 'context-options', template },
    });
    const data = response.data as ContextRecordsPageData;
    setContextRecordType(data.contextRecordType);
    setContextRecords(data.records);
    setSelectedContextRecord(null);
    setContextJson('');
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getPage({ pageName: 'EmailTemplates' });
      const data = response.data as EmailTemplatesPageData;
      setMeta({ templates: data.templates, languages: data.languages });
      applyRecord(data.record);
      if (data.record) {
        await loadContextOptions(data.record.template);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load email templates:', err);
      setError('Unable to load email templates.');
    } finally {
      setLoading(false);
    }
  }, [loadContextOptions]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadTinyMce = useCallback(async () => {
    if (window.tinymce) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${TINYMCE_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        return;
      }

      const script = document.createElement('script');
      script.src = TINYMCE_SCRIPT;
      script.referrerPolicy = 'origin';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load TinyMCE'));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (loading || !editorRef.current) {
      return undefined;
    }

    let editorInstance: { getContent: () => string; setContent: (value: string) => void; remove: () => void } | null = null;
    let cancelled = false;

    const initEditor = async () => {
      try {
        await loadTinyMce();
        if (cancelled || !window.tinymce || !editorRef.current) {
          return;
        }

        const editors = await window.tinymce.init({
          target: editorRef.current,
          height: 420,
          menubar: false,
          plugins: 'code link lists',
          toolbar: 'undo redo | bold italic | bullist numlist | link | code',
          content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
          setup: (editor: { on: (event: string, callback: () => void) => void }) => {
            editor.on('change keyup', () => {
              const current = window.tinymce?.get(EDITOR_ID);
              if (current) {
                setContentRich(serializeHtmlEditor(current.getContent()));
              }
            });
          },
        });

        editorInstance = editors[0] ?? null;
        editorReady.current = true;
        editorInstance?.setContent(contentRich);
      } catch (err) {
        console.error('TinyMCE init failed:', err);
        setError('Unable to load the HTML editor.');
      }
    };

    initEditor();

    return () => {
      cancelled = true;
      editorInstance?.remove();
      editorReady.current = false;
    };
  }, [loading, loadTinyMce]);

  const getCurrentRichContent = (): string => {
    if (editorReady.current && window.tinymce) {
      const editor = window.tinymce.get(EDITOR_ID);
      if (editor) {
        return serializeHtmlEditor(editor.getContent());
      }
    }
    return serializeHtmlEditor(contentRich);
  };

  const formatRichContent = (rawRich: string) => {
    const prepared = prepareHtmlForSubmit(rawRich);
    syncEditorContent(prepared.formatted);
    setLintWarnings(prepared.warnings);
    return prepared.formatted;
  };

  const postAction = async (
    action: 'load' | 'preview',
    options?: { formatBeforeSend?: boolean },
    contextJsonOverride?: string,
  ) => {
    if (!selectedTemplate || !selectedLanguage) {
      setError('Select a template and language first.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const rawRich = getCurrentRichContent();
    const contentRichToSend = options?.formatBeforeSend === false
      ? rawRich
      : formatRichContent(rawRich);

    try {
      const response = await api.getPage({
        pageName: 'EmailTemplates',
        method: 'post',
        data: {
          action,
          template: selectedTemplate.value,
          language: selectedLanguage.value,
          subject,
          contentRich: contentRichToSend,
          contentPlain,
          contextJson: contextJsonOverride ?? contextJson,
        },
      });

      const data = response.data as EmailTemplatesPageData;
      setMeta({ templates: data.templates, languages: data.languages });
      applyRecord(data.record);

      if (action === 'preview' && data.preview) {
        setPreview(data.preview);
      }
      if (action === 'load' && data.record) {
        await loadContextOptions(data.record.template);
      }
    } catch (err) {
      console.error(`Email template ${action} failed:`, err);
      setError(`Unable to ${action} the template.`);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate || !selectedLanguage) {
      setError('Select a template and language first.');
      return;
    }

    if (!recordId) {
      setError('Load a template before saving.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const contentRichToSend = formatRichContent(getCurrentRichContent());

    try {
      const response = await api.recordAction({
        resourceId: EMAIL_TEMPLATE_RESOURCE_ID,
        actionName: 'edit',
        recordId: String(recordId),
        data: {
          subject,
          contentRich: contentRichToSend,
          contentPlain,
        },
      });

      const params = response.data?.record?.params as EmailTemplateRecord | undefined;
      if (params) {
        applyRecord({
          id: Number(params.id ?? recordId),
          template: String(params.template ?? selectedTemplate.value),
          language: String(params.language ?? selectedLanguage.value),
          subject: String(params.subject ?? subject),
          contentRich: String(params.contentRich ?? contentRichToSend),
          contentPlain: String(params.contentPlain ?? contentPlain),
        });
      }

      setSuccess('Template saved.');
      setPreview(null);
    } catch (err) {
      console.error('Email template save failed:', err);
      setError('Unable to save the template.');
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = () => postAction('load', { formatBeforeSend: false });
  const handlePreview = async () => {
    let previewContextJson = contextJson;

    if (!previewContextJson.trim() && contextRecords[0]) {
      try {
        previewContextJson = await loadContextRecord(contextRecords[0]);
      } catch (err) {
        console.error('Failed to load the first context record:', err);
        setError('Unable to load the first context record.');
        return;
      }
    }

    if (previewContextJson.trim()) {
      try {
        const parsed = JSON.parse(previewContextJson);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Context must be a JSON object');
        }
      } catch (err) {
        setError(`Invalid context JSON: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }

    return postAction('preview', undefined, previewContextJson);
  };

  const handleTemplateChange = async (option: { value: string; label: string } | null) => {
    setSelectedTemplate(option);
    if (!option) {
      setContextRecords([]);
      setSelectedContextRecord(null);
      setContextJson('');
      return;
    }

    setContextRecordType(getContextRecordType(option.value));
    try {
      await loadContextOptions(option.value);
    } catch (err) {
      console.error('Failed to load context records:', err);
      setError('Unable to load context records.');
    }
  };

  const loadContextRecord = async (option: { value: string; label: string }): Promise<string> => {
    const response = await api.getPage({
      pageName: 'EmailTemplates',
      method: 'post',
      data: { action: 'load-context', recordType: contextRecordType, recordId: option.value },
    });
    const data = response.data as ContextRecordsPageData;
    const nextContextJson = JSON.stringify(data.context ?? {}, null, 2);
    setSelectedContextRecord(option);
    setContextJson(nextContextJson);
    setError(null);
    return nextContextJson;
  };

  const handleContextRecordChange = async (option: { value: string; label: string } | null) => {
    if (!option) {
      setSelectedContextRecord(null);
      setContextJson('');
      return;
    }

    try {
      await loadContextRecord(option);
    } catch (err) {
      console.error('Failed to load context record:', err);
      setError('Unable to load the selected context record.');
    }
  };

  if (loading) {
    return <Box padding="xl"><Text>Loading email templates...</Text></Box>;
  }

  if (!meta || meta.templates.length === 0) {
    return (
      <Box padding="xl">
        <Text color="error">No email templates found for this event.</Text>
      </Box>
    );
  }

  return (
    <Box padding="xl">
      <H2>Email templates</H2>
      {error && <Text color="error" mb="lg">{error}</Text>}
      {success && <Text color="success" mb="lg">{success}</Text>}

      <Box bg="white" p="xl" boxShadow="card" mb="xl">
        <Box flex flexWrap="wrap" style={{ gap: '16px' }} mb="lg">
          <FormGroup style={{ minWidth: '240px' }}>
            <Label>Template</Label>
            <Select
              value={selectedTemplate}
              options={templateOptions}
              onChange={handleTemplateChange}
            />
          </FormGroup>
          <FormGroup style={{ minWidth: '160px' }}>
            <Label>Language</Label>
            <Select
              value={selectedLanguage}
              options={languageOptions}
              onChange={(option: { value: string; label: string } | null) => setSelectedLanguage(option)}
            />
          </FormGroup>
          <Box flex alignItems="flex-end" style={{ gap: '8px' }}>
            <Button variant="outlined" disabled={busy} onClick={handleLoad}>
              Load
            </Button>
          </Box>
        </Box>

        <FormGroup mb="lg" style={{ width: '100%' }}>
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSubject(event.target.value)}
            style={{ width: '100%' }}
          />
        </FormGroup>

        <FormGroup mb="lg" style={{ width: '100%' }}>
          <Label>HTML content</Label>
          <Text color="grey60" mb="md">
            Use the editor toolbar <strong>code</strong> button for source HTML and Handlebars blocks such as {'{{#if registration.email_guardian}}'}.
          </Text>
          <textarea
            id={EDITOR_ID}
            ref={editorRef}
            defaultValue={contentRich}
            style={{ width: '100%', minHeight: '420px' }}
          />
        </FormGroup>

        <FormGroup mb="lg" style={{ width: '100%' }}>
          <Label>Plain text</Label>
          <TextArea
            rows={12}
            value={contentPlain}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setContentPlain(event.target.value)}
            style={{ width: '100%', fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
        </FormGroup>

        {lintWarnings.length > 0 && (
          <Box mt="lg">
            <Text fontWeight="bold" mb="sm">HTML warnings</Text>
            {lintWarnings.map((warning, index) => (
              <Text key={`${warning.message}-${index}`} color="grey60">
                {warning.line ? `Line ${warning.line}: ` : ''}{warning.message}
              </Text>
            ))}
          </Box>
        )}

        <Box flex justifyContent="space-between" alignItems="center" mt="xl" flexWrap="wrap" style={{ gap: '12px' }}>
          <Box flex style={{ gap: '8px' }}>
            <Button variant="contained" disabled={busy} onClick={handleSave}>
              {busy ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box bg="white" p="lg" boxShadow="card" mb="xl">
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            <span>Rendering context JSON</span>
            <Button
              variant="outlined"
              disabled={busy}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                void handlePreview();
              }}
              style={{ marginLeft: '16px' }}
            >
              {busy ? 'Previewing...' : 'Preview'}
            </Button>
          </summary>
          <Box mt="lg">
            <Box flex flexWrap="wrap" style={{ gap: '16px' }} mb="lg">
              <FormGroup style={{ minWidth: '240px' }}>
                <Label>Context record type</Label>
                <Input
                  value={contextRecordType === 'registration' ? 'Registration' : 'User'}
                  onChange={() => undefined}
                />
              </FormGroup>
              <FormGroup style={{ minWidth: '360px', flex: 1 }}>
                <Label>Context record</Label>
                <Select
                  value={selectedContextRecord}
                  options={contextRecords}
                  isClearable
                  isDisabled={contextRecords.length === 0}
                  placeholder={`Select a ${contextRecordType}`}
                  onChange={handleContextRecordChange}
                />
              </FormGroup>
            </Box>
            <Text color="grey60" mb="md">
              Select a record above to load real data, then edit the JSON before previewing.
            </Text>
            <TextArea
              rows={14}
              value={contextJson}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setContextJson(event.target.value)}
              style={{ width: '100%', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
          </Box>
        </details>
      </Box>

      {preview && (
        <Box bg="white" p="xl" boxShadow="card">
          <H2 mb="lg">Preview</H2>
          <Text fontWeight="bold" mb="sm">Subject</Text>
          <Text mb="lg">{preview.subject}</Text>
          <Text fontWeight="bold" mb="sm">HTML</Text>
          <iframe
            title="Email HTML preview"
            sandbox=""
            srcDoc={preview.html}
            style={{ width: '100%', minHeight: '420px', border: '1px solid #ddd' }}
          />
          <Text fontWeight="bold" mt="lg" mb="sm">Plain text</Text>
          <TextArea
            rows={10}
            value={preview.plainText}
            readOnly
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </Box>
      )}
    </Box>
  );
};

export default EmailTemplates;
