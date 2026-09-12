import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
} from '@adminjs/design-system';
import type { DashboardResponse } from './handler.js';

const api = new ApiClient();

// AdminJS's own URL scheme for the default (unmodified) rootPath — see
// ViewHelpers in the adminjs package. resourceId is a Sequelize table name,
// not the model class name (e.g. Registration -> 'Registrations').
const resourceUrl = (resourceId: string, query?: string) =>
  `/admin/resources/${resourceId}${query ? `?${query}` : ''}`;
const pageUrl = (pageName: string) => `/admin/pages/${pageName}`;

const dateFormatter = new Intl.DateTimeFormat('en-BE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('en-BE', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(date?: Date | string): string {
  if (!date) return 'not set';
  return dateFormatter.format(new Date(date));
}

function formatTime(date?: Date | string): string {
  if (!date) return '';
  return timeFormatter.format(new Date(date));
}

/** Event day has no "end" field of its own — it's one calendar day starting at `officialStartDate`. */
function endOfDay(date: Date | string): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

type StepStatus = 'done' | 'active' | 'upcoming';

interface TimelineLink {
  label: string;
  href: string;
}

interface SubActivity {
  label: string;
  start?: Date | string;
  end?: Date | string;
  isOpen?: boolean;
}

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  start?: Date | string;
  end?: Date | string;
  /** Show the start time (e.g. event day's kickoff hour) alongside the date instead of just the date. */
  showStartTime?: boolean;
  /** An activity nested inside this step (voting is tracked separately from the event day — its window can start before and run for days after). */
  subActivity?: SubActivity;
  links: TimelineLink[];
}

function getStepStatus(now: number, step: TimelineStep): StepStatus {
  if (!step.start) {
    // No fixed start of its own (e.g. "Event setup" — work starts whenever
    // staff start it, tracked by no field) — just a deadline to be done by.
    if (!step.end) return 'upcoming';
    return now > new Date(step.end).getTime() ? 'done' : 'active';
  }
  const startMs = new Date(step.start).getTime();
  const endMs = step.end ? new Date(step.end).getTime() : startMs;
  if (now < startMs) return 'upcoming';
  if (now > endMs) return 'done';
  return 'active';
}

function stepDateLabel(step: TimelineStep): string {
  if (!step.start) {
    return step.end ? `Before ${formatDate(step.end)}` : 'No deadline';
  }
  if (step.showStartTime) {
    return `${formatDate(step.start)}, ${formatTime(step.start)}`;
  }
  if (
    !step.end ||
    new Date(step.end).getTime() === new Date(step.start).getTime()
  ) {
    return formatDate(step.start);
  }
  return `${formatDate(step.start)} → ${formatDate(step.end)}`;
}

function isSameDay(a: Date | string, b: Date | string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/** Voting's window isn't confined to the event day, so unlike `stepDateLabel` this always shows the date, not just the time. */
function subActivityLabel(activity: SubActivity): string {
  if (!activity.start) return `${activity.label}: not scheduled`;
  if (!activity.end) {
    return `${activity.label}: ${formatDate(activity.start)}, ${formatTime(activity.start)}`;
  }
  if (isSameDay(activity.start, activity.end)) {
    return `${activity.label}: ${formatDate(activity.start)}, ${formatTime(activity.start)} – ${formatTime(activity.end)}`;
  }
  return `${activity.label}: ${formatDate(activity.start)}, ${formatTime(activity.start)} – ${formatDate(activity.end)}, ${formatTime(activity.end)}`;
}

function isSubActivityOpen(
  now: number,
  start?: Date | string,
  end?: Date | string,
): boolean {
  if (!start || !end) return false;
  return now >= new Date(start).getTime() && now <= new Date(end).getTime();
}

/** Later of end-of-event-day and votingEndDate — wrap-up can't start before either. */
function wrapUpStartDate(data: DashboardResponse): Date | undefined {
  if (!data.officialStartDate) return undefined;
  const eventDayEnd = endOfDay(data.officialStartDate);
  if (!data.votingEndDate) return eventDayEnd;
  const votingEnd = new Date(data.votingEndDate);
  return votingEnd > eventDayEnd ? votingEnd : eventDayEnd;
}

function buildTimeline(data: DashboardResponse, now: number): TimelineStep[] {
  return [
    {
      key: 'setup',
      label: 'Event setup',
      icon: 'Settings',
      end: data.registrationOpenDate,
      links: [
        { label: 'Event', href: resourceUrl('Events') },
        { label: 'T-shirts', href: resourceUrl('Tshirts') },
        { label: 'Email templates', href: pageUrl('EmailTemplates') },
        { label: 'Questions', href: resourceUrl('Questions') },
      ],
    },
    {
      key: 'registration',
      label: 'Registration',
      icon: 'UserPlus',
      start: data.registrationOpenDate,
      end: data.registrationClosedDate,
      links: [
        { label: 'Registrations', href: resourceUrl('Registrations') },
        {
          label: 'Waiting list',
          href: resourceUrl('Registrations', 'filters.waiting_list=true'),
        },
      ],
    },
    {
      key: 'projects',
      label: 'Event day preparation',
      icon: 'Folder',
      start: data.registrationClosedDate,
      end: data.projectClosedDate,
      links: [
        { label: 'Projects', href: resourceUrl('Projects') },
        { label: 'Assign tables', href: pageUrl('Tables') },
      ],
    },
    {
      key: 'event-day',
      label: 'Event day',
      icon: 'MapPin',
      start: data.officialStartDate,
      end: data.officialStartDate && endOfDay(data.officialStartDate),
      showStartTime: true,
      subActivity: {
        label: 'Voting',
        start: data.votingStartDate,
        end: data.votingEndDate,
        isOpen: isSubActivityOpen(now, data.votingStartDate, data.votingEndDate),
      },
      links: [
        { label: 'Floor plans', href: pageUrl('Floorplans') },
        { label: 'Presentation', href: pageUrl('Presentation') },
        { label: 'Voting overview', href: pageUrl('VotingOverview') },
      ],
    },
    {
      key: 'wrap-up',
      label: 'Results & wrap-up',
      icon: 'CheckCircle',
      // Starts once the event day itself is over (not merely once voting
      // closes, which can happen hours before the event day ends), and runs
      // until eventEndDate, when the event is fully closed down for the year
      // (logins disabled — see the `closed` virtual on the Event model).
      start: data.officialStartDate && wrapUpStartDate(data),
      end: data.eventEndDate,
      links: [
        { label: 'Awards', href: resourceUrl('Awards') },
        { label: 'Certificates', href: pageUrl('Certificates') },
        { label: 'Reporting', href: resourceUrl('view_Export_all') },
      ],
    },
  ];
}

const statusColor: Record<StepStatus, string> = {
  done: '#007D7F',
  active: '#3040D6',
  upcoming: '#BBC3CB',
};

const StepCard: React.FC<{ step: TimelineStep; status: StepStatus }> = ({
  step,
  status,
}) => (
  <Box
    bg={status === 'active' ? '#EEF1FD' : 'white'}
    boxShadow="card"
    borderTop={`4px solid ${statusColor[status]}`}
    p="lg"
    flex
    flexDirection="column"
    style={{ minWidth: '220px', flex: '1 1 220px' }}
  >
    <Box flex flexDirection="row" alignItems="center" mb="default">
      <Box
        flex
        alignItems="center"
        justifyContent="center"
        bg={status === 'upcoming' ? 'white' : statusColor[status]}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          border: `2px solid ${statusColor[status]}`,
          flexShrink: 0,
        }}
      >
        <Icon
          icon={status === 'done' ? 'Check' : step.icon}
          size={16}
          color={status === 'upcoming' ? statusColor.upcoming : 'white'}
        />
      </Box>
      <Text ml="default" fontWeight="bold" fontSize="lg">
        {step.label}
      </Text>
    </Box>

    {status === 'active' && (
      <Text
        color="white"
        bg="#3040D6"
        fontSize="xs"
        fontWeight="bold"
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '9999px',
          width: 'fit-content',
        }}
        mb="sm"
      >
        HAPPENING NOW
      </Text>
    )}

    <Text color="grey60" fontSize="sm" mb={step.subActivity ? 'sm' : 'default'}>
      {stepDateLabel(step)}
    </Text>

    {step.subActivity && (
      <Box
        flex
        alignItems="center"
        bg="grey20"
        mb="default"
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          width: 'fit-content',
          gap: '8px',
        }}
      >
        <Icon icon="Award" size={12} color="grey60" />
        <Text ml="sm" fontSize="xs" color="grey100">
          {subActivityLabel(step.subActivity)}
        </Text>
        {step.subActivity.isOpen && (
          <Text
            color="white"
            bg="#16a34a"
            fontSize="xs"
            fontWeight="bold"
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            OPEN NOW
          </Text>
        )}
      </Box>
    )}

    <Box flex flexWrap="wrap" mt="auto" pt="lg" style={{ gap: '12px' }}>
      {step.links.map((link) => (
        <Box
          key={link.href}
          as="a"
          href={link.href}
          bg="grey20"
          color="grey100"
          fontSize="xs"
          fontWeight="bold"
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          {link.label}
        </Box>
      ))}
    </Box>
  </Box>
);

const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  href?: string;
  accent?: string;
  sub?: React.ReactNode;
}> = ({ label, value, href, accent = '#BBC3CB', sub }) => (
  <Box
    as={href ? 'a' : 'div'}
    href={href}
    bg="white"
    p="lg"
    boxShadow="card"
    borderTop={`4px solid ${accent}`}
    style={{ textDecoration: 'none', display: 'block' }}
  >
    <Text color="grey60" fontSize="sm">
      {label}
    </Text>
    <Text color="grey100" fontSize="h2" fontWeight="bold">
      {value}
    </Text>
    {sub && (
      <Text color="grey60" fontSize="xs">
        {sub}
      </Text>
    )}
  </Box>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Text fontSize="lg" fontWeight="bold" color="grey100" mb="default" mt="xxl">
    {children}
  </Text>
);

const TileGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    display="grid"
    gridTemplateColumns="repeat(auto-fit, minmax(170px, 1fr))"
  >
    {children}
  </Box>
);

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    api.getDashboard().then((response) => {
      if (isSubscribed) {
        setData(response.data as DashboardResponse);
        setNow(Date.now());
        setLoading(false);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <Box p="xl">
        <Text>Loading dashboard...</Text>
      </Box>
    );
  }

  const timeline = buildTimeline(data, now);
  const stepsWithStatus = timeline.map((step) => ({
    step,
    status: getStepStatus(now, step),
  }));
  const currentStep = stepsWithStatus.find(({ status }) => status === 'active');
  const nextStep = stepsWithStatus.find(({ status }) => status === 'upcoming');

  const projectFillPct = data.maxRegistration
    ? Math.min(
        100,
        Math.round((data.total_projects / data.maxRegistration) * 100),
      )
    : 0;

  return (
    <Box>
      <Box bg="#0C1E29" color="white" px={['default', 'lg', 'xxl']} py="xl">
        <Text fontSize="h1" fontWeight="bold" color="white" mb="default">
          {data.event_title}
        </Text>
        {currentStep ? (
          <Text fontSize="lg" color="white">
            Now: <strong>{currentStep.step.label}</strong> —{' '}
            {stepDateLabel(currentStep.step)}
          </Text>
        ) : nextStep ? (
          <Text fontSize="lg" color="white">
            Next up: <strong>{nextStep.step.label}</strong> —{' '}
            {stepDateLabel(nextStep.step)}
            {data.days_remaining > 0 &&
              nextStep.step.key === 'event-day' &&
              ` (${data.days_remaining} day${data.days_remaining === 1 ? '' : 's'} to go)`}
          </Text>
        ) : (
          <Text fontSize="lg" color="white">
            All steps for this event are complete.
          </Text>
        )}
      </Box>

      <Box px={['default', 'lg', 'xxl']} py="xl">
        <Text fontSize="lg" fontWeight="bold" color="grey100" mb="default">
          Event timeline
        </Text>
        <Box flex flexWrap="wrap">
          {stepsWithStatus.map(({ step, status }) => (
            <StepCard key={step.key} step={step} status={status} />
          ))}
        </Box>

        <SectionTitle>Registrations</SectionTitle>
        <TileGrid>
          <StatTile
            label="Registrations"
            value={data.pending_users}
            href={resourceUrl('Registrations')}
            accent="#3040D6"
          />
          <StatTile
            label="Overdue"
            value={data.overdue_registration}
            href={resourceUrl('Registrations')}
            accent={data.overdue_registration > 0 ? '#C20012' : undefined}
          />
          <StatTile
            label="Waiting list"
            value={data.waiting_list}
            href={resourceUrl('Registrations', 'filters.waiting_list=true')}
            accent={data.waiting_list > 0 ? '#A14F17' : undefined}
          />
          <StatTile
            label="Unused vouchers"
            value={data.total_unusedVouchers}
            href={resourceUrl('UserProjects')}
          />
        </TileGrid>

        <SectionTitle>Projects &amp; participants</SectionTitle>
        <TileGrid>
          <StatTile
            label="Projects"
            value={`${data.total_projects} / ${data.maxRegistration}`}
            href={resourceUrl('Projects')}
            accent="#3040D6"
            sub={
              <Box
                bg="grey20"
                mt="sm"
                style={{
                  height: '6px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  bg="#3040D6"
                  style={{ height: '100%', width: `${projectFillPct}%` }}
                />
              </Box>
            }
          />
          <StatTile
            label="Co-workers"
            value={data.total_usedVouchers}
            href={resourceUrl('UserProjects')}
          />
          <StatTile
            label="Without a project"
            value={data.total_users_without_project}
            href={resourceUrl('Users')}
            accent={
              data.total_users_without_project > 0 ? '#A14F17' : undefined
            }
          />
          <StatTile
            label="Confirmed photos"
            value={data.total_videos}
            href={resourceUrl('Attachments', 'filters.confirmed=true')}
          />
          <StatTile
            label="Total participants"
            value={data.total_users}
            href={resourceUrl('Users')}
          />
        </TileGrid>

        <SectionTitle>Participant demographics</SectionTitle>
        <TileGrid>
          <StatTile label="Dutch" value={data.tlang_nl} />
          <StatTile label="French" value={data.tlang_fr} />
          <StatTile label="English" value={data.tlang_en} />
          <StatTile label="Female" value={data.total_females} />
          <StatTile label="Male" value={data.total_males} />
          <StatTile label="X" value={data.total_X} />
        </TileGrid>

        <SectionTitle>Consent answers</SectionTitle>
        <Box bg="white" boxShadow="card" p="lg">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.total}</TableCell>
                  <TableCell>{question.short}</TableCell>
                  <TableCell>{question.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <SectionTitle>T-shirt orders</SectionTitle>
        <Box bg="white" boxShadow="card" p="lg" mb="xl">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>Shirt</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.tshirts.map((tshirt) => (
                <TableRow key={tshirt.id}>
                  <TableCell>{tshirt.total}</TableCell>
                  <TableCell>{tshirt.short}</TableCell>
                  <TableCell>{tshirt.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
