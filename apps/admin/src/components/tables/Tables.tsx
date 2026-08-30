import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { Box, Button, CheckBox, H2, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@adminjs/design-system';
import type { TableOverview } from './handler.js';

const api = new ApiClient();

export const Tables: React.FC = () => {
	const [data, setData] = useState<TableOverview | null>(null);
	const [loading, setLoading] = useState(true);
	const [busyId, setBusyId] = useState<number | null>(null);
	const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
	const [error, setError] = useState<string | null>(null);

	const loadTables = async () => {
		try {
			const response = await api.getPage({ pageName: 'Tables' });
			setData(response.data as TableOverview);
			setError(null);
		} catch (err) {
			console.error('Failed to load tables:', err);
			setError('Unable to load tables.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTables();
	}, []);

	const updateAssignment = async (tableId: number, projectId: string) => {
		setBusyId(tableId);
		try {
			const response = await api.getPage({
				pageName: 'Tables',
				method: 'post',
				data: { action: 'assign', tableId, projectId },
			});
			setData(response.data as TableOverview);
			setError(null);
		} catch (err) {
			console.error('Failed to assign project:', err);
			setError('Unable to update the table assignment.');
		} finally {
			setBusyId(null);
		}
	};

	const removeTable = async (tableId: number) => {
		if (!window.confirm('Remove this table? Use this for a no-show.')) {
			return;
		}

		setBusyId(tableId);
		try {
			const response = await api.getPage({
				pageName: 'Tables',
				method: 'post',
				data: { action: 'remove-table', tableId },
			});
			setData(response.data as TableOverview);
			setError(null);
		} catch (err) {
			console.error('Failed to remove table:', err);
			setError('Unable to remove the table.');
		} finally {
			setBusyId(null);
		}
	};

	const toggleTableSelection = (tableId: number) => {
		setSelectedTableIds((current) => current.includes(tableId)
			? current.filter((id) => id !== tableId)
			: current.length < 2 ? [...current, tableId] : current);
	};

	const swapTables = async () => {
		if (selectedTableIds.length !== 2) return;

		setBusyId(-1);
		try {
			const response = await api.getPage({
				pageName: 'Tables',
				method: 'post',
				data: { action: 'swap-tables', tableIds: selectedTableIds },
			});
			setData(response.data as TableOverview);
			setSelectedTableIds([]);
			setError(null);
		} catch (err) {
			console.error('Failed to swap tables:', err);
			setError('Unable to swap the table assignments.');
		} finally {
			setBusyId(null);
		}
	};

	if (loading) {
		return <Box padding="xl"><Text>Loading tables...</Text></Box>;
	}

	if (!data) {
		return <Box padding="xl"><Text color="error">{error ?? 'Unable to load tables.'}</Text></Box>;
	}

	return (
		<Box padding="xl">
			<H2>Table assignments</H2>
			{error && <Text color="error" mb="lg">{error}</Text>}
			<Box bg="white" p="xl" boxShadow="card">
				<Box flex justifyContent="space-between" alignItems="center" mb="lg">
					<Text color="grey60">Select two tables to exchange their project assignments.</Text>
					<Button
						size="sm"
						variant="contained"
						disabled={selectedTableIds.length !== 2 || busyId === -1}
						onClick={swapTables}
					>
						{busyId === -1 ? 'Swapping...' : 'Swap selected'}
					</Button>
				</Box>
				{data.tables.length === 0 ? (
					<Text color="grey60">No tables are configured for this event.</Text>
				) : (
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Table</TableCell>
								<TableCell>Select</TableCell>
								<TableCell>Project</TableCell>
								<TableCell>Capacity</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.tables.map((table) => (
								<TableRow key={table.id}>
									<TableCell><Text fontWeight="bold">{table.name}</Text></TableCell>
									<TableCell>
										<CheckBox
											checked={selectedTableIds.includes(table.id)}
											disabled={!selectedTableIds.includes(table.id) && selectedTableIds.length === 2}
											onChange={() => toggleTableSelection(table.id)}
										/>
									</TableCell>
									<TableCell>
										<select
											value={table.projectId ?? ''}
											disabled={busyId === table.id}
											onChange={(event) => updateAssignment(table.id, event.target.value)}
											style={{ minWidth: '260px', padding: '8px' }}
										>
											<option value="">Unassigned</option>
											{data.projects.map((project) => (
												<option key={project.id} value={project.id}>{project.name}</option>
											))}
										</select>
									</TableCell>
									<TableCell>{table.maxPlaces}</TableCell>
									<TableCell align="right">
										<Button
											size="sm"
											variant="outlined"
											disabled={busyId === table.id}
											onClick={() => removeTable(table.id)}
										>
											Remove table
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</Box>
		</Box>
	);
};

export default Tables;
