import {
  canDeleteProject,
  mapOwnerToParticipant,
  mapParticipantsForProject,
  mapVoucherToParticipant,
} from './participant.mapper';

describe('participant.mapper', () => {
  it('maps owner as registered self participant', () => {
    expect(mapOwnerToParticipant({ id: 1, firstname: 'Alex' })).toEqual({
      id: 1,
      name: 'Alex',
      self: true,
      is_owner: true,
      status: 'registered',
    });
  });

  it('marks owner as not self when viewed by a co-participant', () => {
    expect(mapOwnerToParticipant({ id: 1, firstname: 'Alex' }, 5)).toEqual({
      id: 1,
      name: 'Alex',
      self: false,
      is_owner: true,
      status: 'registered',
    });
  });

  it('maps pending voucher with token', () => {
    expect(
      mapVoucherToParticipant({
        id: 10,
        voucherGuid: 'abc-123',
        participantId: null,
      }),
    ).toEqual({
      id: 10,
      name: '',
      self: false,
      is_owner: false,
      status: 'pending',
      token: 'abc-123',
    });
  });

  it('maps registered voucher with participant name', () => {
    expect(
      mapVoucherToParticipant({
        id: 11,
        voucherGuid: 'def-456',
        participantId: 5,
        participant: { firstname: 'Sam' },
      }),
    ).toEqual({
      id: 11,
      name: 'Sam',
      self: false,
      is_owner: false,
      status: 'registered',
    });
  });

  it('marks registered voucher as self for the current co-participant', () => {
    expect(
      mapVoucherToParticipant(
        {
          id: 11,
          voucherGuid: 'def-456',
          participantId: 5,
          participant: { firstname: 'Sam' },
        },
        5,
      ),
    ).toEqual({
      id: 11,
      name: 'Sam',
      self: true,
      is_owner: false,
      status: 'registered',
    });
  });

  it('orders owner first then voucher rows', () => {
    const participants = mapParticipantsForProject(
      { id: 1, firstname: 'Alex' },
      [
        {
          id: 10,
          voucherGuid: 'pending-token',
          participantId: null,
        },
        {
          id: 11,
          voucherGuid: 'used-token',
          participantId: 5,
          participant: { firstname: 'Sam' },
        },
      ],
    );

    expect(participants).toHaveLength(3);
    expect(participants[0].is_owner).toBe(true);
    expect(participants[0].self).toBe(true);
    expect(participants[1].status).toBe('pending');
    expect(participants[2].name).toBe('Sam');
  });

  it('allows project delete only when no registered co-participants exist', () => {
    expect(
      canDeleteProject([
        { id: 1, voucherGuid: 'a', participantId: null },
      ]),
    ).toBe(true);
    expect(
      canDeleteProject([
        { id: 1, voucherGuid: 'a', participantId: 2 },
      ]),
    ).toBe(false);
  });
});
