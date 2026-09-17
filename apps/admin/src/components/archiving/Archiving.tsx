import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { Box, Button, H2, H3, Text } from '@adminjs/design-system';
import type { ArchivingPageData } from './handler.js';

const api = new ApiClient();

function apiBaseUrl(): string {
  return window.location.origin;
}

export const Archiving: React.FC = () => {
  const [data, setData] = useState<ArchivingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getPage({ pageName: 'Archiving' });
        setData(response.data as ArchivingPageData);
      } catch (err) {
        console.error('Failed to load archiving overview:', err);
        setError('Unable to load archiving overview.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <Box padding="xl">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box padding="xl">
      <H2>Archiving</H2>
      {error && (
        <Text color="danger" mb="lg">
          {error}
        </Text>
      )}

      <Box bg="white" boxShadow="card" p="lg">
        <H3>Project archive</H3>
        <Text color="grey60" mb="lg">
          Download a single, self-contained HTML page with every project for
          this event — name, table, participants, description, and photo
          embedded inline. No backend is needed to view it afterward.
        </Text>
        {data && (
          <Text mb="lg">{data.projectCount} project(s) for this event.</Text>
        )}
        <Button
          as="a"
          variant="primary"
          href={`${apiBaseUrl()}/archiving/projects`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download archive
        </Button>
      </Box>
    </Box>
  );
};

export default Archiving;
