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
import { Box, H2, Text } from '@adminjs/design-system';
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

	return (
		<Box padding="xl">
			<H2>Voting overview</H2>

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
				<Text fontSize="h3" fontWeight="bold" mb="xl">Votes over time</Text>
				<Box width="100%" height="320px">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data.votesOverTime} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" tickFormatter={formatVoteTime} />
							<YAxis allowDecimals={false} />
							<Tooltip labelFormatter={formatVoteTime} />
							<Line type="monotone" dataKey="votes" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
						</LineChart>
					</ResponsiveContainer>
				</Box>
				<Text color="grey60" mt="lg">
					Updated {lastUpdated?.toLocaleTimeString() ?? 'recently'}
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
		</Box>
	);
};

export default Voting;
