import React, { useEffect, useRef, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  Button,
  H2,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
} from '@adminjs/design-system';
import type { PresentationAssetsOverview } from './handler.js';

const api = new ApiClient();

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const PresentationAssets: React.FC = () => {
  const [data, setData] = useState<PresentationAssetsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyFilename, setBusyFilename] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAssets = async () => {
    try {
      const response = await api.getPage({ pageName: 'PresentationAssets' });
      setData(response.data as PresentationAssetsOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to load presentation assets:', err);
      setError('Unable to load assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const uploadAsset = async (file: File) => {
    setUploading(true);
    try {
      const imageContentBase64 = await readAsBase64(file);
      const response = await api.getPage({
        pageName: 'PresentationAssets',
        method: 'post',
        data: {
          action: 'upload',
          imageContentBase64,
          originalName: file.name,
        },
      });
      setData(response.data as PresentationAssetsOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to upload asset:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to upload the asset.',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteAsset = async (filename: string) => {
    if (
      !window.confirm(
        `Delete "${filename}"? Slides referencing it will lose that image.`,
      )
    ) {
      return;
    }
    setBusyFilename(filename);
    try {
      const response = await api.getPage({
        pageName: 'PresentationAssets',
        method: 'post',
        data: { action: 'delete', filename },
      });
      setData(response.data as PresentationAssetsOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError('Unable to delete the asset.');
    } finally {
      setBusyFilename(null);
    }
  };

  if (loading) {
    return <Text>Loading assets...</Text>;
  }

  return (
    <Box variant="grey">
      <H2>Presentation assets</H2>
      <Text mb="lg">
        Upload logos or other static art for the slide deck. Reference a file
        from a slide&apos;s body with{' '}
        <code>{"{{lookup assets 'filename.png'}}"}</code>, e.g.{' '}
        <code>{'<img src="{{lookup assets \'logo.png\'}}">'}</code>.
      </Text>

      <Box mb="xl">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg,.gif,image/*"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadAsset(file);
            }
          }}
        />
        {uploading && <Text mt="default">Uploading...</Text>}
      </Box>

      {error && (
        <Text color="danger" mb="lg">
          {error}
        </Text>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Filename</TableCell>
            <TableCell>Uploaded</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(data?.assets ?? []).map((asset) => (
            <TableRow key={asset.filename}>
              <TableCell>{asset.filename}</TableCell>
              <TableCell>
                {new Date(asset.uploadedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busyFilename === asset.filename}
                  onClick={() => deleteAsset(asset.filename)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(data?.assets.length ?? 0) === 0 && (
        <Text mt="lg">No assets uploaded yet.</Text>
      )}
    </Box>
  );
};

export default PresentationAssets;
