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

export function mapOwnerToParticipant(owner: OwnerInput): ParticipantDto {
  return {
    id: owner.id,
    name: owner.firstname,
    self: true,
    status: 'registered',
  };
}

export function mapVoucherToParticipant(voucher: VoucherInput): ParticipantDto {
  if (voucher.participantId != null && voucher.participant) {
    return {
      id: voucher.id,
      name: voucher.participant.firstname,
      self: false,
      status: 'registered',
    };
  }

  return {
    id: voucher.id,
    name: '',
    self: false,
    status: 'pending',
    token: voucher.voucherGuid,
  };
}

export function mapParticipantsForProject(
  owner: OwnerInput,
  vouchers: VoucherInput[],
): ParticipantDto[] {
  return [
    mapOwnerToParticipant(owner),
    ...vouchers.map(mapVoucherToParticipant),
  ];
}

export function canDeleteProject(vouchers: VoucherInput[]): boolean {
  return !vouchers.some((voucher) => voucher.participantId != null);
}
