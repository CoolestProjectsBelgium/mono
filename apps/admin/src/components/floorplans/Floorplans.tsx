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
import type { FloorplansOverview } from './handler.js';

const api = new ApiClient();

export const Floorplans: React.FC = () => {
  const [data, setData] = useState<FloorplansOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyFilename, setBusyFilename] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFloorplans = async () => {
    try {
      const response = await api.getPage({ pageName: 'Floorplans' });
      setData(response.data as FloorplansOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to load floor plans:', err);
      setError('Unable to load floor plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloorplans();
  }, []);

  const setActive = async (filename: string) => {
    setBusyFilename(filename);
    try {
      const response = await api.getPage({
        pageName: 'Floorplans',
        method: 'post',
        data: { action: 'set-active', filename },
      });
      setData(response.data as FloorplansOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to set active floor plan:', err);
      setError('Unable to set the active floor plan.');
    } finally {
      setBusyFilename(null);
    }
  };

  const deleteFloorplan = async (filename: string) => {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) {
      return;
    }
    setBusyFilename(filename);
    try {
      const response = await api.getPage({
        pageName: 'Floorplans',
        method: 'post',
        data: { action: 'delete', filename },
      });
      setData(response.data as FloorplansOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to delete floor plan:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to delete the floor plan.',
      );
    } finally {
      setBusyFilename(null);
    }
  };

  const uploadSvg = async (file: File) => {
    setUploading(true);
    try {
      // A real multipart body — AdminJS's own router parses this via
      // express-formidable for every page-handler action (see
      // buildAuthenticatedRouter in index.ts), same as a resource's file
      // upload would be. axios sends a FormData as multipart automatically.
      const formData = new FormData();
      formData.append('action', 'upload');
      formData.append('file', file, file.name);

      const response = await api.getPage({
        pageName: 'Floorplans',
        method: 'post',
        data: formData,
      });
      setData(response.data as FloorplansOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to upload floor plan:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to upload the floor plan.',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <Text>Loading floor plans...</Text>;
  }

  return (
    <Box variant="grey">
      <H2>Floor plans</H2>
      <Text mb="lg">
        Upload Visio SVG floor plans. The uploaded map is activated for the
        current event automatically.
      </Text>

      <Box mb="xl">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadSvg(file);
            }
          }}
        />
        {uploading && <Text mt="default">Processing upload...</Text>}
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
            <TableCell>Status</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(data?.floorplans ?? []).map((floorplan) => (
            <TableRow key={floorplan.filename}>
              <TableCell>{floorplan.filename}</TableCell>
              <TableCell>
                {new Date(floorplan.uploadedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {floorplan.isActive ? 'Active for this event' : ''}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  disabled={
                    floorplan.isActive || busyFilename === floorplan.filename
                  }
                  onClick={() => setActive(floorplan.filename)}
                >
                  Use for this event
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={
                    floorplan.isActive || busyFilename === floorplan.filename
                  }
                  onClick={() => deleteFloorplan(floorplan.filename)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(data?.floorplans.length ?? 0) === 0 && (
        <Text mt="lg">No floor plans uploaded yet.</Text>
      )}
    </Box>
  );
};

export default Floorplans;
