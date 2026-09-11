import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';

import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CheckBox,
  Button,
  Text,
  Title,
  H2,
  Badge,
  Icon,
} from '@adminjs/design-system';

import type {
  GroupedAttachments,
  PictureAttachment,
  ProjectParticipant,
} from '../pictures/handler.js';

const ParticipantBadge: React.FC<{ participant: ProjectParticipant }> = ({
  participant,
}) => (
  <Badge
    variant={participant.agreedToPhoto ? 'success' : 'danger'}
    outline={!participant.isOwner}
    title={[
      participant.isOwner ? 'Project owner' : 'Participant',
      participant.agreedToPhoto ? 'agreed to photo' : 'did not agree to photo',
    ].join(' · ')}
  >
    <Box flex alignItems="center" gap="default">
      {participant.isOwner && <Icon icon="Star" size={14} />}
      <Icon
        icon={participant.agreedToPhoto ? 'Camera' : 'CameraOff'}
        size={14}
      />
      <Text as="span">{participant.name || 'Unnamed participant'}</Text>
    </Box>
  </Badge>
);

export const PictureHandlerPage: React.FC = () => {
  const [data, setData] = useState<GroupedAttachments>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const api = new ApiClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getPage({ pageName: 'PictureSelector' });
      setData(response.data as GroupedAttachments);
    } catch (err) {
      console.error('Failed to load attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update local state when toggled
  const handleToggle = (
    projectName: string,
    id: number,
    field: 'confirmed' | 'internal',
  ) => {
    setSavedId((currentSavedId) =>
      currentSavedId === id ? null : currentSavedId,
    );
    setData((prev) => {
      const updatedAttachments = prev[projectName].attachments.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item,
      );
      return {
        ...prev,
        [projectName]: {
          ...prev[projectName],
          attachments: updatedAttachments,
        },
      };
    });
  };

  const handleConfirmedChange = (projectName: string, id: number) => {
    setSavedId(null);
    setData((prev) => ({
      ...prev,
      [projectName]: {
        ...prev[projectName],
        attachments: prev[projectName].attachments.map((item) => ({
          ...item,
          confirmed: item.id === id,
        })),
      },
    }));
  };

  // Save changes for a specific attachment
  const handleSave = async (projectName: string, item: PictureAttachment) => {
    setSavingId(item.id);
    setSavedId(null);
    try {
      const itemsToSave = item.confirmed
        ? data[projectName].attachments
        : [item];
      await Promise.all(
        itemsToSave.map((attachment) =>
          api.recordAction({
            resourceId: 'Attachments',
            actionName: 'edit',
            recordId: String(attachment.id),
            data: {
              confirmed: attachment.confirmed,
              internal: attachment.internal,
            },
          }),
        ),
      );
      setSavedId(item.id);
      window.setTimeout(() => {
        setSavedId((currentSavedId) =>
          currentSavedId === item.id ? null : currentSavedId,
        );
      }, 1200);
    } catch (err) {
      console.error(`Failed to update attachment ${item.id}:`, err);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <Box padding="xl">
        <Text>Loading thumbnails...</Text>
      </Box>
    );
  }

  return (
    <Box padding="xl">
      <style>{`
                @keyframes picture-save-flash {
                    0% { background-color: rgba(16, 185, 129, 0.35); }
                    100% { background-color: transparent; }
                }
            `}</style>
      <H2>Attachments</H2>

      {Object.entries(data).map(
        ([projectName, { participants, attachments }]) => (
          <Box key={projectName} mb="xxl" bg="white" p="lg" boxShadow="card">
            <Box
              flex
              alignItems="center"
              flexWrap="wrap"
              gap="lg"
              rowGap="default"
              marginBottom="xl"
            >
              <Title mb={0} mr="default">
                {projectName}
              </Title>
              <Box
                flex
                alignItems="center"
                flexWrap="wrap"
                gap="lg"
                rowGap="default"
              >
                {participants.map((participant) => (
                  <ParticipantBadge
                    key={participant.id}
                    participant={participant}
                  />
                ))}
              </Box>
            </Box>
            {attachments.length === 0 ? (
              <Text color="grey60">No attachments found for this project.</Text>
            ) : (
              <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '100px' }}>Thumbnail</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="center" style={{ width: '100px' }}>
                      Internal
                    </TableCell>
                    <TableCell align="center" style={{ width: '110px' }}>
                      Confirmed
                    </TableCell>
                    <TableCell align="right" style={{ width: '160px' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attachments.map((item) => (
                    <TableRow
                      key={item.id}
                      style={
                        savedId === item.id
                          ? { animation: 'picture-save-flash 1.2s ease-out' }
                          : undefined
                      }
                    >
                      <TableCell style={{ width: '100px' }}>
                        {item.thumbnailUrl ? (
                          <a
                            href={item.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={item.thumbnailUrl}
                              alt={`View full image: ${item.name}`}
                              style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            />
                          </a>
                        ) : (
                          <Text color="grey60">No Image</Text>
                        )}
                      </TableCell>

                      <TableCell>
                        <Text fontweight="bold">{item.name}</Text>
                      </TableCell>

                      <TableCell align="center">
                        <CheckBox
                          checked={item.internal}
                          onChange={() =>
                            handleToggle(projectName, item.id, 'internal')
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <input
                          type="radio"
                          name={`confirmed-${projectName}`}
                          checked={item.confirmed}
                          onChange={() =>
                            handleConfirmedChange(projectName, item.id)
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box flex alignItems="center" gap="lg">
                          <Button
                            size="sm"
                            variant="contained"
                            style={{ width: '110px' }}
                            disabled={savingId === item.id}
                            onClick={() => handleSave(projectName, item)}
                          >
                            {savingId === item.id ? 'Saving...' : 'Save Flags'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        ),
      )}
    </Box>
  );
};

export default PictureHandlerPage;
