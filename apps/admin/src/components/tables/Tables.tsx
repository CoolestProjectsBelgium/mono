import React, { useEffect, useMemo, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  H2,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
} from '@adminjs/design-system';
import type { ProjectAssignment, TableOverview } from './handler.js';

const api = new ApiClient();

const languageLabels: Record<string, string> = {
  nl: 'Dutch',
  fr: 'French',
  en: 'English',
};

type GroupBy = 'none' | 'type' | 'affiliation' | 'language';

const groupOptions: Array<{ value: GroupBy; label: string }> = [
  { value: 'none', label: 'No grouping' },
  { value: 'type', label: 'Project type' },
  { value: 'affiliation', label: 'Affiliation' },
  { value: 'language', label: 'Language' },
];

const groupKeyFor = (project: ProjectAssignment, groupBy: GroupBy): string => {
  switch (groupBy) {
    case 'type':
      return project.type?.trim() || 'No type set';
    case 'affiliation':
      return project.affiliations.length > 0
        ? project.affiliations.join(' + ')
        : 'No affiliation';
    case 'language':
      return languageLabels[project.language] ?? project.language;
    default:
      return 'All projects';
  }
};

export const Tables: React.FC = () => {
  const [data, setData] = useState<TableOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyProjectId, setBusyProjectId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

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

  const assignProjectToTable = async (
    project: ProjectAssignment,
    tableIdValue: string,
  ) => {
    setBusyProjectId(project.id);
    try {
      const targetTableId =
        tableIdValue === '' ? project.tableId : Number(tableIdValue);
      if (targetTableId === null) {
        // Already unassigned and "Unassigned" was (re)selected: nothing to do.
        return;
      }
      const response = await api.getPage({
        pageName: 'Tables',
        method: 'post',
        data: {
          action: 'assign',
          tableId: targetTableId,
          projectId: tableIdValue === '' ? '' : String(project.id),
        },
      });
      setData(response.data as TableOverview);
      setError(null);
    } catch (err) {
      console.error('Failed to assign table:', err);
      setError('Unable to update the table assignment.');
    } finally {
      setBusyProjectId(null);
    }
  };

  const assignedTableIds = useMemo(
    () =>
      new Set(
        (data?.projects ?? [])
          .map((project) => project.tableId)
          .filter((tableId): tableId is number => tableId !== null),
      ),
    [data],
  );

  const groupedProjects = useMemo(() => {
    if (!data) return [];
    const groups = new Map<string, ProjectAssignment[]>();
    for (const project of data.projects) {
      const key = groupKeyFor(project, groupBy);
      const group = groups.get(key) ?? [];
      group.push(project);
      groups.set(key, group);
    }
    const fallbackLabels = new Set(['No type set', 'No affiliation']);
    return Array.from(groups, ([label, projects]) => ({
      label,
      projects,
    })).sort((first, second) => {
      if (groupBy === 'none') return 0;
      const firstFallback = fallbackLabels.has(first.label);
      const secondFallback = fallbackLabels.has(second.label);
      if (firstFallback !== secondFallback) return firstFallback ? 1 : -1;
      return first.label.localeCompare(second.label);
    });
  }, [data, groupBy]);

  if (loading) {
    return (
      <Box padding="xl">
        <Text>Loading tables...</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box padding="xl">
        <Text color="error">{error ?? 'Unable to load tables.'}</Text>
      </Box>
    );
  }

  return (
    <Box padding="xl">
      <H2>Table assignments</H2>
      {error && (
        <Text color="error" mb="lg">
          {error}
        </Text>
      )}

      <Box bg="white" p="xl" boxShadow="card">
        <Box
          flex
          justifyContent="space-between"
          alignItems="flex-end"
          flexWrap="wrap"
          style={{ gap: '16px' }}
          mb="lg"
        >
          <Box>
            <Text fontSize="h3" fontWeight="bold">
              Assign tables to projects
            </Text>
            <Text color="grey60">
              Group projects by an indicator to spot who fits together before
              picking a table.
            </Text>
          </Box>
          <Box style={{ minWidth: '220px' }}>
            <Text color="grey60" mb="sm">
              Group by
            </Text>
            <Select
              value={{
                value: groupBy,
                label:
                  groupOptions.find((option) => option.value === groupBy)
                    ?.label ?? '',
              }}
              options={groupOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(option: { value: GroupBy } | null) =>
                setGroupBy(option?.value ?? 'none')
              }
            />
          </Box>
        </Box>

        {data.projects.length === 0 ? (
          <Text color="grey60">No projects are registered for this event.</Text>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Affiliation</TableCell>
                <TableCell>Table</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedProjects.map((group) => (
                <React.Fragment key={group.label}>
                  {groupBy !== 'none' && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{ background: '#f1f5f9', padding: '8px 10px' }}
                      >
                        <Text fontWeight="bold">{group.label}</Text>
                        <Text color="grey60" as="span">
                          {' '}
                          ({group.projects.length} project
                          {group.projects.length === 1 ? '' : 's'})
                        </Text>
                      </TableCell>
                    </TableRow>
                  )}
                  {group.projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Text fontWeight="bold">{project.name}</Text>
                      </TableCell>
                      <TableCell>{project.type || '-'}</TableCell>
                      <TableCell>
                        {languageLabels[project.language] ?? project.language}
                      </TableCell>
                      <TableCell>
                        {project.affiliations.length > 0
                          ? project.affiliations.join(', ')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <select
                          value={project.tableId ?? ''}
                          disabled={busyProjectId === project.id}
                          onChange={(event) =>
                            void assignProjectToTable(
                              project,
                              event.target.value,
                            )
                          }
                          style={{ minWidth: '220px', padding: '8px' }}
                        >
                          <option value="">Unassigned</option>
                          {data.tables
                            .filter(
                              (table) =>
                                table.id === project.tableId ||
                                !assignedTableIds.has(table.id),
                            )
                            .map((table) => (
                              <option key={table.id} value={table.id}>
                                {table.name} ({table.maxPlaces} seats)
                              </option>
                            ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default Tables;
