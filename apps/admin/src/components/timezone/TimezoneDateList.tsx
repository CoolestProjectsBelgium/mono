import React from 'react';
import { useCurrentAdmin } from 'adminjs';
import type { ShowPropertyProps } from 'adminjs';
import { formatInTimezone } from './format-in-timezone.js';

// List-view counterpart of TimezoneDateShow — see apps/admin/src/index.ts
// for which Event date fields use these (this one for `list`).
const TimezoneDateList: React.FC<ShowPropertyProps> = ({
  property,
  record,
}) => {
  const [currentAdmin] = useCurrentAdmin();
  const timezone = (currentAdmin as { timezone?: string } | null)?.timezone;

  return (
    <span>{formatInTimezone(record.params[property.path], timezone)}</span>
  );
};

export default TimezoneDateList;
