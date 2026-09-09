import { deriveReminderReasons, hasAnyReminderReason, ReminderReasons } from './reminder-reasons';

describe('deriveReminderReasons', () => {
  it('flags noProject and never noPhoto when the user has no projects at all', () => {
    const reasons = deriveReminderReasons({ projects: [] }, false);

    expect(reasons.noProject).toBe(true);
    expect(reasons.noPhoto).toBe(false);
  });

  it('flags noPhoto (not noProject) when every project has zero attachments', () => {
    const reasons = deriveReminderReasons(
      { projects: [{ attachments: [] }, { attachments: [] }] },
      false,
    );

    expect(reasons.noProject).toBe(false);
    expect(reasons.noPhoto).toBe(true);
  });

  it('flags neither when at least one project has an attachment', () => {
    const reasons = deriveReminderReasons(
      { projects: [{ attachments: [] }, { attachments: [{ id: 1 }] }] },
      false,
    );

    expect(reasons.noProject).toBe(false);
    expect(reasons.noPhoto).toBe(false);
  });

  it('passes deadlineApproaching through independently, combined with either project state', () => {
    expect(deriveReminderReasons({ projects: [] }, true)).toEqual<ReminderReasons>({
      noProject: true,
      noPhoto: false,
      deadlineApproaching: true,
    });

    expect(
      deriveReminderReasons({ projects: [{ attachments: [{ id: 1 }] }] }, true),
    ).toEqual<ReminderReasons>({
      noProject: false,
      noPhoto: false,
      deadlineApproaching: true,
    });
  });
});

describe('hasAnyReminderReason', () => {
  it('is false when nothing applies', () => {
    expect(
      hasAnyReminderReason({ noProject: false, noPhoto: false, deadlineApproaching: false }),
    ).toBe(false);
  });

  it('is true when any single reason applies', () => {
    expect(
      hasAnyReminderReason({ noProject: true, noPhoto: false, deadlineApproaching: false }),
    ).toBe(true);
    expect(
      hasAnyReminderReason({ noProject: false, noPhoto: true, deadlineApproaching: false }),
    ).toBe(true);
    expect(
      hasAnyReminderReason({ noProject: false, noPhoto: false, deadlineApproaching: true }),
    ).toBe(true);
  });
});
