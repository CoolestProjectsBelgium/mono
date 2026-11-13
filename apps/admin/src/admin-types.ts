/**
 * Shapes AdminJS hands to our page handlers and hooks. AdminJS itself types
 * these as `any` (or an index signature of `any`), so they are narrowed here
 * to what this app actually reads.
 */

/** The logged-in admin: what components/login/authenticate.ts returns. */
export interface AdminUser {
  id?: number | string;
  email?: string;
  /**
   * The event selected on the login form. It is posted as a form field, so at
   * runtime this can be a numeric string; Sequelize and the API coerce it.
   */
  eventId?: number;
  /** Account.account_type — only 'super_admin' and 'admin' can log in. */
  role?: string;
}

export interface AdminPageContext {
  currentAdmin?: AdminUser;
}

/** Request object passed to custom page handlers and resource `before` hooks. */
export interface AdminPageRequest {
  method?: string;
  /** Survives AdminJS's shallow copy of the Express request; see NestApiClient. */
  rawHeaders?: string[];
  payload?: Record<string, unknown>;
  query?: Record<string, unknown> & { filters?: Record<string, unknown> };
}

/**
 * Reads a payload field as text. Form fields arrive as strings; a missing
 * field reads as ''. Same coercion as `String(value ?? '')`.
 */
export function payloadString(value: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- form fields are primitives
  return String(value ?? '');
}
