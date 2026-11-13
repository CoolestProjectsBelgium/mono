import { BadRequestException } from '@nestjs/common';

/**
 * Shapes of `req.user` per auth guard. Passport puts whatever the matching
 * strategy's `validate()` returns on the request, so the shape depends on
 * which guard protected the route.
 */

/** `JwtUserAuthGuard` — the participant's `User` row (see jwt.strategy.ts). */
export interface ParticipantRequestUser {
  id: number;
  isAdmin?: never;
}

/** `MandatoryAdminCookieGuard` — the AdminJS session (see adminauth.service.ts). */
export interface AdminRequestUser {
  isAdmin: true;
  adminUser?: {
    email?: string;
    eventId?: number;
    role?: string;
  };
}

/** `JwtVotingAuthGuard` / `VotingLoginAuthGuard` — a jury account. */
export interface JuryRequestUser {
  id: number;
  eventId: number;
  email?: string;
}

export interface ParticipantRequest {
  user: ParticipantRequestUser;
}

export interface AdminRequest {
  user?: AdminRequestUser;
}

/** `MandatoryAdminOrJwtUserAuthGuard` — either principal. */
export interface AdminOrParticipantRequest {
  user: AdminRequestUser | ParticipantRequestUser;
}

export interface JuryRequest {
  user: JuryRequestUser;
}

/** The event the admin selected at AdminJS login; 400 when the session has none. */
export function requireAdminEventId(req: AdminRequest): number {
  const eventId = req.user?.adminUser?.eventId;
  if (!eventId) {
    throw new BadRequestException('No event selected');
  }
  return eventId;
}
