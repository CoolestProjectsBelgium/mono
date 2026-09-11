export interface ReminderReasons {
  noProject: boolean;
  noPhoto: boolean;
  deadlineApproaching: boolean;
}

/**
 * Derives which reminder reasons apply to a user. `noPhoto` is only ever
 * true when the user actually has a project — without that guard, a user
 * with no project at all would also be flagged `noPhoto` (a LEFT JOIN to
 * `projects`→`attachments` produces `NULL` in both the "no project" and the
 * "project has no attachments" case, so the two can't be told apart from
 * the query alone).
 */
export function deriveReminderReasons(
  user: { projects: Array<{ attachments: unknown[] }> },
  deadlineApproaching: boolean,
): ReminderReasons {
  const hasProject = user.projects.length > 0;
  const hasPhoto = user.projects.some(
    (project) => project.attachments.length > 0,
  );

  return {
    noProject: !hasProject,
    noPhoto: hasProject && !hasPhoto,
    deadlineApproaching,
  };
}

export function hasAnyReminderReason(reasons: ReminderReasons): boolean {
  return reasons.noProject || reasons.noPhoto || reasons.deadlineApproaching;
}
