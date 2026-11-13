// AdminJS only accepts super_admin/admin logins (see components/login/authenticate.ts).
// roles (Account.account_type): super_admin (can access everything, incl. all events and accounts),
// admin (can access resources of the selected event), can update their own account/password.
// jury accounts never reach this app — they authenticate separately against the voting SPA.

import type {
  AdminPageContext,
  AdminPageRequest,
  AdminUser,
} from './admin-types.js';

/** A scalar record/session field value, as compared by the access checks below. */
type FieldValue = string | number | boolean | null | undefined;

/** The parts of AdminJS's ActionContext the access checks read. */
interface AccessArgs {
  currentAdmin?: AdminUser;
  resource?: { id?: unknown };
  record?: { params?: Record<string, FieldValue> };
}

export const filterEventId =
  (filterName: string) =>
  async <R extends AdminPageRequest>(
    request: R,
    context: AdminPageContext,
  ): Promise<R> => {
    const eventId = context.currentAdmin?.eventId;

    return {
      ...request,
      query: {
        ...request.query,
        filters: {
          ...request.query?.filters,
          [filterName]: eventId,
        },
      },
      payload: request.payload
        ? {
            ...request.payload,
            [filterName]: eventId,
          }
        : request.payload,
    };
  };

// Same idea as filterEventId, but lets a given role (super_admin by default) bypass the filter
// entirely, seeing every record. Used for resources that are not scoped to a single event
// (Event itself, Account) where only super_admin should see everything.
export const filterUnlessRole =
  (
    filterName: string,
    getValue: (currentAdmin: AdminUser) => unknown,
    bypassRole: string = 'super_admin',
  ) =>
  async <R extends AdminPageRequest>(
    request: R,
    context: AdminPageContext,
  ): Promise<R> => {
    if (context.currentAdmin?.role === bypassRole) return request;

    return {
      ...request,
      query: {
        ...request.query,
        filters: {
          ...request.query?.filters,
          [filterName]: getValue(context.currentAdmin as AdminUser),
        },
      },
    };
  };

export const addEventFilter = async <R extends AdminPageRequest>(
  filterName: string = 'id',
  request: R,
  context: AdminPageContext,
): Promise<R> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) return request;

  return {
    ...request,
    query: {
      ...request.query,
      filters: {
        ...request.query?.filters,
        [filterName]: eventId,
      },
    },
    payload: request.payload
      ? { ...request.payload, eventId }
      : request.payload,
  };
};

export const canCreate = ({ currentAdmin, resource }: AccessArgs) => {
  if (currentAdmin!.role === 'super_admin') return true;
  if (currentAdmin?.role !== 'admin' || !currentAdmin?.eventId) return false;
  if (resource?.id === 'Account') return false;
  return true;
};

export const canAccessResourceFieldFilter =
  (fieldName: string) =>
  ({ currentAdmin, record }: AccessArgs) => {
    const adminValue = currentAdmin?.eventId;
    return record?.params?.[fieldName] === adminValue;
  };

// Generalised version of canAccessResourceFieldFilter: compares a field on the record against
// an arbitrary field on currentAdmin (e.g. a user's own Account id), instead of always eventId.
export const canAccessResourceFieldMatch =
  (recordField: string, adminField: string) =>
  ({ currentAdmin, record }: AccessArgs) => {
    const recordValue = record?.params?.[recordField];
    return (
      recordValue !== undefined &&
      recordValue !== null &&
      String(recordValue) ===
        String((currentAdmin as Record<string, FieldValue>)?.[adminField])
    );
  };

export type AccessHandler = (args: AccessArgs) => boolean;

export const andAccess =
  (...filters: AccessHandler[]): AccessHandler =>
  (args) =>
    filters.every((filter) => filter(args));

export const orAccess =
  (...filters: AccessHandler[]): AccessHandler =>
  (args) =>
    filters.some((filter) => filter(args));

export const canAccessResourceRoleFilter =
  (roleName: string) =>
  ({ currentAdmin }: AccessArgs) =>
    currentAdmin!.role === roleName;
