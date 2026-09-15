import React from 'react';
import { useCurrentAdmin } from 'adminjs';
import type { ShowPropertyProps } from 'adminjs';
import { ValueGroup } from '@adminjs/design-system';
import { formatInTimezone } from './format-in-timezone.js';

// Show-view counterpart of TimezoneDateList — see apps/admin/src/index.ts
// for which Event date fields use these (this one for `show`).
const TimezoneDateShow: React.FC<ShowPropertyProps> = ({
  property,
  record,
}) => {
  const [currentAdmin] = useCurrentAdmin();
  const timezone = (currentAdmin as { timezone?: string } | null)?.timezone;

  return (
    <ValueGroup label={property.label}>
      {formatInTimezone(record.params[property.path], timezone)}
    </ValueGroup>
  );
};

export default TimezoneDateShow;
