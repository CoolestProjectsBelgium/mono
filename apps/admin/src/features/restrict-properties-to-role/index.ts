import { buildFeature } from 'adminjs';

import { restrictedPropertiesBeforeHook } from './before-hook.js';

// Reusable AdminJS feature (see https://docs.adminjs.co/tutorials/adding-role-based-access-control):
// attach to any resource via `features: [restrictPropertiesToRoleFeature]`, then tag the
// properties that should only be editable by a given role, e.g.:
//
//   options: {
//     properties: { account_type: { custom: { role: 'super_admin' } } },
//     features: [restrictPropertiesToRoleFeature],
//   }
//
// Anyone without that role still sees the field's value, but cannot change it: it is
// hidden from the edit form and, as a backend backstop, stripped from the payload.
export const restrictPropertiesToRoleFeature = buildFeature((admin) => {
  const RoleRestrictedEditAction = admin.componentLoader.add(
    'RoleRestrictedEditAction',
    './RoleRestrictedEditAction.tsx',
  );

  return {
    actions: {
      edit: {
        component: RoleRestrictedEditAction,
        before: restrictedPropertiesBeforeHook,
      },
    },
  };
});
