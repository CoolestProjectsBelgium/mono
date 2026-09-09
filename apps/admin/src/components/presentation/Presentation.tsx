import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  Button,
  FormGroup,
  H2,
  H3,
  Label,
  Select,
  Text,
  TextArea,
} from '@adminjs/design-system';
import type {
  DeckSlideSummary,
  PresentationPageData,
  PresentationSlideConfig,
  ProjectOption,
} from './handler.js';

const api = new ApiClient();
const DEFAULT_SLIDE_SECONDS = 5;
const PRESENTATION_SLIDE_RESOURCE_ID = 'PresentationSlide';

const Presentation: React.FC = () => {
  const [configs, setConfigs] = useState<PresentationSlideConfig[]>([]);
  const [slides, setSlides] = useState<DeckSlideSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const [selectedConfig, setSelectedConfig] = useState<{ value: string; label: string } | null>(null);
  const [draftBody, setDraftBody] = useState('');
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<{ value: string; label: string } | null>(null);
  const [previewImageBase64, setPreviewImageBase64] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const configOptions = configs.map((config) => ({
    value: String(config.id),
    label: `${config.title} (#${config.id})`,
  }));

  const activeConfig = configs.find((config) => String(config.id) === selectedConfig?.value) ?? null;
  const needsProjectPicker = activeConfig?.dataSource === 'projects' && activeConfig?.cardinality === 'perRecord';

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getPage({ pageName: 'Presentation' });
      const data = response.data as PresentationPageData;
      setConfigs(data.configs);
      setSlides(data.slides);
      setCurrentIndex(0);
      setError(null);
    } catch (err) {
      console.error('Failed to load the presentation deck:', err);
      setError('Unable to load the presentation deck.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const currentSlide = slides[currentIndex] ?? null;
  const slideSeconds = currentSlide?.time && currentSlide.time > 0 ? currentSlide.time : DEFAULT_SLIDE_SECONDS;

  useEffect(() => {
    if (!playing || slides.length < 2) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, slideSeconds * 1000);

    return () => clearTimeout(timer);
  }, [playing, slides.length, slideSeconds, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((index) => (slides.length === 0 ? 0 : (index - 1 + slides.length) % slides.length));
  };

  const goToNext = () => {
    setCurrentIndex((index) => (slides.length === 0 ? 0 : (index + 1) % slides.length));
  };

  const handleConfigChange = async (option: { value: string; label: string } | null) => {
    setSelectedConfig(option);
    setSelectedProjectId(null);
    setPreviewImageBase64(null);
    setProjectOptions([]);
    setError(null);

    const config = configs.find((candidate) => String(candidate.id) === option?.value) ?? null;
    setDraftBody(config?.body ?? '');

    if (config && config.dataSource === 'projects' && config.cardinality === 'perRecord') {
      setBusy(true);
      try {
        const response = await api.getPage({
          pageName: 'Presentation',
          method: 'post',
          data: { action: 'load-projects' },
        });
        const data = response.data as PresentationPageData;
        setProjectOptions(data.projectOptions ?? []);
      } catch (err) {
        console.error('Failed to load visible projects:', err);
        setError('Unable to load visible projects for this slide.');
      } finally {
        setBusy(false);
      }
    }
  };

  const handlePreview = async () => {
    if (!activeConfig) {
      setError('Select a slide to edit first.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.getPage({
        pageName: 'Presentation',
        method: 'post',
        data: {
          action: 'preview',
          slideId: activeConfig.id,
          body: draftBody,
          projectId: selectedProjectId?.value,
        },
      });
      const data = response.data as PresentationPageData;
      setPreviewImageBase64(data.previewImageBase64 ?? null);
    } catch (err) {
      console.error('Failed to render the slide preview:', err);
      setError('Unable to render this slide. Check the template for errors.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!activeConfig) {
      setError('Select a slide to edit first.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await api.recordAction({
        resourceId: PRESENTATION_SLIDE_RESOURCE_ID,
        actionName: 'edit',
        recordId: String(activeConfig.id),
        data: { body: draftBody },
      });
      setSuccess('Template saved.');
      setPreviewImageBase64(null);
      await loadPage();
    } catch (err) {
      console.error('Failed to save the slide template:', err);
      setError('Unable to save the template.');
    } finally {
      setBusy(false);
    }
  };

  const carouselLabel = useMemo(
    () => (slides.length === 0 ? '' : `${currentIndex + 1} / ${slides.length}`),
    [currentIndex, slides.length],
  );

  if (loading) {
    return <Box padding="xl"><Text>Loading the presentation deck...</Text></Box>;
  }

  return (
    <Box padding="xl">
      <H2>Presentation preview</H2>
      {error && <Text color="error" mb="lg">{error}</Text>}
      {success && <Text color="success" mb="lg">{success}</Text>}

      <Box bg="white" p="xl" boxShadow="card" mb="xl">
        <Box flex justifyContent="space-between" alignItems="center" mb="lg">
          <H3>Deck carousel</H3>
          <Button variant="outlined" size="sm" disabled={busy} onClick={loadPage}>
            Refresh deck
          </Button>
        </Box>

        {slides.length === 0 ? (
          <Text color="grey60">No slides configured yet. Add rows on the Presentation resource page.</Text>
        ) : (
          <Box>
            <Box
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
              mb="md"
            >
              {currentSlide && (
                <img
                  key={currentSlide.key}
                  src={currentSlide.imageUrl}
                  alt={currentSlide.key}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              )}
            </Box>
            <Box flex justifyContent="space-between" alignItems="center" style={{ gap: '8px' }}>
              <Box flex style={{ gap: '8px' }}>
                <Button size="sm" onClick={goToPrevious}>Previous</Button>
                <Button size="sm" onClick={() => setPlaying((value) => !value)}>
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button size="sm" onClick={goToNext}>Next</Button>
              </Box>
              <Text color="grey60">{carouselLabel}</Text>
            </Box>
          </Box>
        )}
      </Box>

      <Box bg="white" p="xl" boxShadow="card">
        <H3 mb="lg">Quick-edit a slide template</H3>

        <FormGroup mb="lg" style={{ maxWidth: '480px' }}>
          <Label>Slide</Label>
          <Select
            value={selectedConfig}
            options={configOptions}
            isClearable
            placeholder="Select a slide to edit"
            onChange={handleConfigChange}
          />
        </FormGroup>

        {activeConfig && (
          <>
            {needsProjectPicker && (
              <FormGroup mb="lg" style={{ maxWidth: '480px' }}>
                <Label>Preview with project</Label>
                <Select
                  value={selectedProjectId}
                  options={projectOptions.map((project) => ({ value: String(project.id), label: project.name }))}
                  isClearable
                  isDisabled={projectOptions.length === 0}
                  placeholder="First visible project"
                  onChange={setSelectedProjectId}
                />
              </FormGroup>
            )}

            <FormGroup mb="lg" style={{ width: '100%' }}>
              <Label>Template (Handlebars + HTML)</Label>
              <TextArea
                rows={14}
                value={draftBody}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDraftBody(event.target.value)}
                style={{ width: '100%', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </FormGroup>

            <Box flex style={{ gap: '8px' }} mb="lg">
              <Button variant="outlined" disabled={busy} onClick={handlePreview}>
                {busy ? 'Rendering...' : 'Preview'}
              </Button>
              <Button variant="contained" disabled={busy} onClick={handleSave}>
                {busy ? 'Saving...' : 'Save'}
              </Button>
            </Box>

            {previewImageBase64 && (
              <Box>
                <Text fontWeight="bold" mb="sm">Preview (not saved yet)</Text>
                <img
                  src={`data:image/png;base64,${previewImageBase64}`}
                  alt="Slide preview"
                  style={{ width: '100%', maxWidth: '960px', border: '1px solid #ddd' }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Presentation;
