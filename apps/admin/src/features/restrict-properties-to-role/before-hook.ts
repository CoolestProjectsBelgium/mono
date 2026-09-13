import { ActionRequest, ActionContext, Before } from 'adminjs';

type RestrictedProperty = { custom?: { role?: string } };

// Generic RBAC backstop: any property tagged `custom: { role: '<role>' }` in a resource's
// options is stripped from the submitted payload unless the current admin has that exact
// role. Pairs with RoleRestrictedEditAction.tsx, which hides the same fields from the edit
// form; this hook is what makes the restriction hold even if the form is bypassed (e.g. a
// raw POST to the edit endpoint).
export const restrictedPropertiesBeforeHook: Before = (
  request: ActionRequest,
  context: ActionContext,
) => {
  const { method, payload } = request;
  if (method !== 'post' || !payload) return request;

  const { properties } = context.resource
    .decorate()
    .toJSON(context.currentAdmin) as {
    properties: Record<string, RestrictedProperty>;
  };
  const currentRole = context.currentAdmin?.role as string | undefined;

  const restrictedFields = Object.entries(properties)
    .filter(([, property]) => {
      const requiredRole = property.custom?.role;
      return requiredRole && requiredRole !== currentRole;
    })
    .map(([name]) => name);

  if (!restrictedFields.length) return request;

  const filteredPayload = { ...payload };
  restrictedFields.forEach((name) => delete filteredPayload[name]);
  return { ...request, payload: filteredPayload };
};
