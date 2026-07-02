import { ParticipantDto } from '../dto/participant.dto';

export type OwnerInput = {
  id: number;
  firstname: string;
};

export type VoucherInput = {
  id: number;
  voucherGuid: string;
  participantId: number | null;
  participant?: { firstname: string } | null;
};

export function mapOwnerToParticipant(
  owner: OwnerInput,
  currentUserId?: number,
): ParticipantDto {
  return {
    id: owner.id,
    name: owner.firstname,
    self: currentUserId != null ? owner.id === currentUserId : true,
    is_owner: true,
    status: 'registered',
  };
}

export function mapVoucherToParticipant(
  voucher: VoucherInput,
  currentUserId?: number,
): ParticipantDto {
  if (voucher.participantId != null && voucher.participant) {
    return {
      id: voucher.id,
      name: voucher.participant.firstname,
      self: currentUserId != null && voucher.participantId === currentUserId,
      is_owner: false,
      status: 'registered',
    };
  }

  return {
    id: voucher.id,
    name: '',
    self: false,
    is_owner: false,
    status: 'pending',
    token: voucher.voucherGuid,
  };
}

export function mapParticipantsForProject(
  owner: OwnerInput,
  vouchers: VoucherInput[],
  currentUserId?: number,
): ParticipantDto[] {
  return [
    mapOwnerToParticipant(owner, currentUserId),
    ...vouchers.map((voucher) => mapVoucherToParticipant(voucher, currentUserId)),
  ];
}

export function canDeleteProject(vouchers: VoucherInput[]): boolean {
  return !vouchers.some((voucher) => voucher.participantId != null);
}
