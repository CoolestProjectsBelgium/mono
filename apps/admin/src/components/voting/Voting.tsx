import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { Bar } from 'recharts/es6/cartesian/Bar.js';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid.js';
import { Line } from 'recharts/es6/cartesian/Line.js';
import { XAxis } from 'recharts/es6/cartesian/XAxis.js';
import { YAxis } from 'recharts/es6/cartesian/YAxis.js';
import { BarChart } from 'recharts/es6/chart/BarChart.js';
import { LineChart } from 'recharts/es6/chart/LineChart.js';
import { Legend } from 'recharts/es6/component/Legend.js';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer.js';
import { Tooltip } from 'recharts/es6/component/Tooltip.js';
import { Box, Button, H2, Input, Text, TextArea } from '@adminjs/design-system';
import type { VotingOverview } from './handler.js';

const api = new ApiClient();
const refreshInterval = 15000;
const formatVoteTime = (value: string) => new Date(value).toLocaleTimeString([], {
	hour: '2-digit',
	minute: '2-digit',
});

export const Voting: React.FC = () => {
	const [data, setData] = useState<VotingOverview | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [durationMinutes, setDurationMinutes] = useState('60');
	const [message, setMessage] = useState('');
	const [actionBusy, setActionBusy] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const [showRestartConfirm, setShowRestartConfirm] = useState(false);

	const startVoting = () => {
		setShowRestartConfirm(true);
	};

	const confirmRestart = (deletePreviousResults: boolean) => {
		setShowRestartConfirm(false);
		void runAction('start', undefined, undefined, deletePreviousResults);
	};
	const fetchData = async () => {
		try {
			const response = await api.getPage({ pageName: 'VotingOverview' });
			setData(response.data as VotingOverview);
			setLastUpdated(new Date());
			setError(false);
		} catch (err) {
			console.error('Failed to load voting overview:', err);
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	const runAction = async (action: 'start' | 'stop' | 'message' | 'generate-awards' | 'assign-award', awardId?: number, categoryId?: number | null, deletePreviousResults = false) => {
		setActionBusy(true);
		setActionError(null);
		try {
			await api.getPage({
				pageName: 'VotingOverview',
				method: 'post',
				data: {
					action,
					durationMinutes: Number(durationMinutes),
					message,
						awardId,
						categoryId,
						deletePreviousResults,
				},
			});
			setMessage('');
			await fetchData();
		} catch (err) {
			console.error(`Voting ${action} failed:`, err);
			setActionError(err instanceof Error ? err.message : `Unable to ${action} voting.`);
		} finally {
			setActionBusy(false);
		}
	};

	useEffect(() => {
		fetchData();
		const interval = window.setInterval(fetchData, refreshInterval);
		return () => window.clearInterval(interval);
	}, []);

	if (loading) {
		return <Box padding="xl"><Text>Loading voting overview...</Text></Box>;
	}

	if (error && !data) {
		return <Box padding="xl"><Text color="error">Unable to load voting overview.</Text></Box>;
	}

	if (!data) {
		return null;
	}

	const metrics = [
		{ label: 'Votes cast', value: data.totalVotes, color: '#2563eb' },
		{ label: 'Projects', value: data.totalProjects, color: '#64748b' },
		{ label: 'Projects with votes', value: data.projectsWithVotes, color: '#059669' },
		{ label: 'Projects without votes', value: data.projectsWithoutVotes, color: '#d97706' },
	];
		const categories = Array.from(new Set(
			data.votesByProjectCategory.flatMap((project) =>
				Object.keys(project).filter((key) => key !== 'project'),
			),
		));
	const awardCategories = Array.from(new Map(
		data.awards.flatMap((award) => award.candidates.map((candidate) => [candidate.categoryId, candidate.categoryName] as const)),
	).entries());

	return (
		<Box padding="xl">
			<H2>Voting overview</H2>

			{showRestartConfirm && (
				<Box
					role="presentation"
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 1000,
						background: 'rgba(15, 23, 42, 0.45)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '24px',
					}}
				>
					<Box
						role="dialog"
						aria-modal="true"
						aria-labelledby="restart-voting-title"
						bg="white"
						p="xl"
						boxShadow="card"
						style={{ width: '100%', maxWidth: '520px' }}
					>
						<H2 id="restart-voting-title" mb="lg">Restart voting?</H2>
						<Text mb="lg">
							Choose whether to keep the existing votes and awards. Keeping them is useful when voting is paused for a technical issue.
						</Text>
						<Box bg="warning" p="lg" mb="xl">
							<Text>
								Deleting results permanently removes this event&apos;s votes and award assignments.
							</Text>
						</Box>
						<Box flex justifyContent="flex-end" flexWrap="wrap" style={{ gap: '12px' }}>
							<Button variant="outlined" disabled={actionBusy} onClick={() => setShowRestartConfirm(false)}>
								Cancel
							</Button>
							<Button
								variant="contained"
								disabled={actionBusy}
								onClick={() => confirmRestart(false)}
								style={{ backgroundColor: '#15803d', color: 'white', fontWeight: 700 }}
							>
								Keep results and restart
							</Button>
							<Button
								variant="contained"
								disabled={actionBusy}
								onClick={() => confirmRestart(true)}
								style={{ backgroundColor: '#b91c1c', color: 'white', fontWeight: 700 }}
							>
								Delete results and restart
							</Button>
						</Box>
					</Box>
				</Box>
			)}

				<Box bg="white" p="lg" boxShadow="card" mb="xl">
					<Box flex flexWrap="wrap" alignItems="flex-end" style={{ gap: '16px' }}>
						<Box>
							<Text color="grey60" mb="sm">Voting status</Text>
							<Box
								role="status"
								aria-label={`Voting ${data.votingStatus.votingOpen ? 'open' : 'closed'}`}
								title={`Voting ${data.votingStatus.votingOpen ? 'open' : 'closed'}`}
								style={{
									width: '18px',
									height: '18px',
									borderRadius: '50%',
									backgroundColor: data.votingStatus.votingOpen ? '#16a34a' : '#dc2626',
									boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.08)',
								}}
							/>
						</Box>
						<Box style={{ minWidth: '150px' }}>
							<Text color="grey60" mb="sm">Duration (minutes)</Text>
							<Input
								value={durationMinutes}
								type="number"
								min={1}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDurationMinutes(event.target.value)}
							/>
						</Box>
						<Button
							variant="contained"
							disabled={actionBusy || data.votingStatus.votingOpen}
							onClick={startVoting}
							style={{ minHeight: '48px', padding: '0 24px', fontSize: '16px', fontWeight: 700 }}
						>
							{data.votingStatus.votingOpen ? 'Voting open' : 'Start / restart voting'}
						</Button>
						<Button
							variant="outlined"
							disabled={actionBusy || !data.votingStatus.votingOpen}
							onClick={() => void runAction('stop')}
							style={{ minHeight: '48px', padding: '0 24px', fontSize: '16px', fontWeight: 700 }}
						>
							Stop voting
						</Button>
					</Box>
					<Box mt="xl" p="lg" style={{ borderTop: '1px solid #e5e7eb', background: '#f8fafc' }}>
						<Text fontSize="h3" fontWeight="bold" mb="sm">Broadcast message</Text>
						<Text color="grey60" mb="md">Send a message directly to connected voting clients.</Text>
						<Box flex alignItems="flex-end" flexWrap="wrap" style={{ gap: '12px' }}>
						<Box flexGrow={1} style={{ width: '100%' }}>
							<TextArea
								rows={3}
								value={message}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value)}
								style={{ width: '100%', boxSizing: 'border-box' }}
							/>
						</Box>
						<Button
							variant="contained"
							disabled={actionBusy || !message.trim()}
							onClick={() => void runAction('message')}
							style={{ minHeight: '44px', padding: '0 20px', fontWeight: 700 }}
						>
							Send message
						</Button>
						</Box>
					</Box>
					{actionError && <Text color="error" mt="sm">{actionError}</Text>}
				</Box>

			{error && (
				<Box bg="error" color="white" p="default" mb="lg">
					<Text color="white">The latest refresh failed. Showing the last successful update.</Text>
				</Box>
			)}

			<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="lg" mb="xxl">
				{metrics.map((metric) => (
					<Box key={metric.label} bg="white" p="lg" boxShadow="card" borderTop={`4px solid ${metric.color}`}>
						<Text color="grey60">{metric.label}</Text>
						<Text fontSize="h2" fontWeight="bold">{metric.value}</Text>
					</Box>
				))}
			</Box>

			<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap="xl">
			<Box bg="white" p="xl" boxShadow="card">
								<Text fontSize="h3" fontWeight="bold" mb="xl">Votes remaining</Text>
				<Box width="100%" height="320px">
					<ResponsiveContainer width="100%" height="100%">
										<LineChart data={data.votesOverTime} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" tickFormatter={formatVoteTime} />
											<YAxis allowDecimals={false} domain={[0, 'dataMax']} />
							<Tooltip labelFormatter={formatVoteTime} />
											<Line type="monotone" dataKey="votesRemaining" name="Votes remaining" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
						</LineChart>
					</ResponsiveContainer>
				</Box>
				<Text color="grey60" mt="lg">
									{data.totalExpectedVotes.toLocaleString()} expected votes. Updated {lastUpdated?.toLocaleTimeString() ?? 'recently'}
				</Text>
			</Box>

			<Box bg="white" p="xl" boxShadow="card">
				<Text fontSize="h3" fontWeight="bold" mb="xl">Votes by project and category</Text>
				<Box width="100%" height="320px">
					{categories.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data.votesByProjectCategory} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="project" />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Legend />
								{categories.map((category, index) => (
									<Bar key={category} dataKey={category} stackId="votes" fill={['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'][index % 5]} />
								))}
							</BarChart>
						</ResponsiveContainer>
					) : (
						<Text color="grey60">No votes have been cast yet.</Text>
					)}
				</Box>
			</Box>
			</Box>

			<Box bg="white" p="xl" boxShadow="card" mt="xl">
				<Text fontSize="h3" fontWeight="bold" mb="lg">Calculated results</Text>
				{data.votingStatus.votingOpen ? (
					<Text color="grey60">Results become available after voting is stopped.</Text>
				) : data.results.length === 0 ? (
					<Text color="grey60">No calculated votes are available yet.</Text>
				) : (
					<Box style={{ overflowX: 'auto' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr>
									{['Project', 'Category', 'Adjusted score', 'Median', 'Participation', 'Outliers'].map((heading) => (
										<th key={heading} style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>{heading}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{data.results.map((result) => (
									<tr key={`${result.projectId}-${result.categoryId}`}>
										<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{result.projectName}</td>
										<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{result.categoryName}</td>
										<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', minWidth: '180px' }}>
											<strong>{Number(result.adjusted_average_percent).toFixed(1)}%</strong>
											<Box style={{ position: 'relative', height: '8px', background: '#e5e7eb', marginTop: '6px' }}>
												<Box style={{ position: 'absolute', left: `${Number(result.min_percent)}%`, width: `${Math.max(Number(result.max_percent) - Number(result.min_percent), 1)}%`, height: '8px', background: '#93c5fd' }} />
												<Box style={{ position: 'absolute', left: `${Number(result.median_percent)}%`, width: '3px', height: '14px', top: '-3px', background: '#1d4ed8' }} />
											</Box>
										</td>
										<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{Number(result.median_percent).toFixed(1)}%</td>
										<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{Number(result.participation_percent).toFixed(1)}% ({result.vote_count} votes)</td>
										<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{result.has_outliers ? `${result.outlier_count} flagged` : 'None'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</Box>
				)}
			</Box>

			{!data.votingStatus.votingOpen && (
				<Box bg="white" p="xl" boxShadow="card" mt="xl">
					<Box flex justifyContent="space-between" alignItems="center" flexWrap="wrap" style={{ gap: '12px' }}>
						<Box>
							<Text fontSize="h3" fontWeight="bold">Awards</Text>
							<Text color="grey60">One award per project. Select a runner-up to reassign an award.</Text>
						</Box>
						<Button variant="contained" disabled={actionBusy || data.results.length === 0} onClick={() => void runAction('generate-awards')}>
							Generate awards
						</Button>
					</Box>
					{data.awards.length > 0 && (
						<Box mt="xl" style={{ overflowX: 'auto' }}>
							<table style={{ width: '100%', borderCollapse: 'collapse' }}>
								<thead>
									<tr>
										<th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Participant</th>
										{awardCategories.map(([categoryId, categoryName]) => <th key={categoryId} style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>{categoryName}</th>)}
										<th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Assigned award category</th>
									</tr>
								</thead>
								<tbody>
									{data.awards.map((award) => (
										<tr key={award.id}>
											<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
												<strong>{award.projectName}</strong>
											</td>
											{awardCategories.map(([categoryId]) => {
												const candidate = award.candidates.find((item) => item.categoryId === categoryId);
												return <td key={categoryId} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{candidate ? `#${candidate.rank} / ${candidate.adjustedAveragePercent.toFixed(1)}%` : '-'}</td>;
											})}
											<td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
												<select value={award.categoryId ?? ''} disabled={actionBusy} onChange={(event) => void runAction('assign-award', award.id, event.target.value === '' ? null : Number(event.target.value))}>
													<option value="">No award</option>
													{award.candidates.map((candidate) => <option key={candidate.categoryId} value={candidate.categoryId}>#{candidate.rank} {candidate.categoryName} ({candidate.adjustedAveragePercent.toFixed(1)}%)</option>)}
												</select>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
};

export default Voting;
