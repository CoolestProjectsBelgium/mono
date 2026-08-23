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
    Badge
} from '@adminjs/design-system';

import { GroupedAttachments, PictureAttachment } from '../pictures/handler.js'

export const PictureHandlerPage: React.FC = () => {
    const [data, setData] = useState<GroupedAttachments>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [savingId, setSavingId] = useState<number | null>(null);

    const api = new ApiClient();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getPage({ pageName: "PictureSelector" });
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
    const handleToggle = (projectName: string, id: number, field: 'confirmed' | 'internal') => {
        setData((prev) => {
            const updatedGroup = prev[projectName].map((item) =>
                item.id === id ? { ...item, [field]: !item[field] } : item
            );
            return { ...prev, [projectName]: updatedGroup };
        });
    };

    // Save changes for a specific attachment
    const handleSave = async (item: PictureAttachment) => {
        setSavingId(item.id);
        try {
            // Sends update request to standard AdminJS record update handler
            await api.recordAction({
                resourceId: 'Attachments', // Replace with your exact Resource ID if different
                actionName: 'edit',
                recordId: String(item.id),
                data: {
                    confirmed: item.confirmed,
                    internal: item.internal,
                },
            });
        } catch (err) {
            console.error(`Failed to update attachment ${item.id}:`, err);
        } finally {
            setSavingId(null);
        }
    };

    if (loading) {
        return <Box padding="xl"><Text>Loading thumbnails...</Text></Box>;
    }

    return (
        <Box padding="xl">
            <Text variant="h3" mb="xl">Project Attachments Overview</Text>

            {Object.keys(data).length === 0 ? (
                <Text>No attachments found for this event.</Text>
            ) : (
                Object.entries(data).map(([projectName, attachments]) => (
                    <Box key={projectName} mb="xxl" bg="white" p="lg" boxShadow="card">
                        <Badge variant="primary" size="lg" mb="md">
                            {projectName}
                        </Badge>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Thumbnail</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Internal</TableCell>
                                    <TableCell align="center">Confirmed</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attachments.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell style={{ width: '100px' }}>
                                            {item.thumbnailPath ? (
                                                <img
                                                    src={item.thumbnailPath}
                                                    alt={item.name}
                                                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
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
                                                onChange={() => handleToggle(projectName, item.id, 'internal')}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <CheckBox
                                                checked={item.confirmed}
                                                onChange={() => handleToggle(projectName, item.id, 'confirmed')}
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Button
                                                size="sm"
                                                variant="contained"
                                                disabled={savingId === item.id}
                                                onClick={() => handleSave(item)}
                                            >
                                                {savingId === item.id ? 'Saving...' : 'Save Flags'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                ))
            )}
        </Box>
    );
};

export default PictureHandlerPage;