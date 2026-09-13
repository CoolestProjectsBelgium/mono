import React, { FC } from 'react';
import { ActionProps, BaseActionComponent, useCurrentAdmin } from 'adminjs';

// Frontend half of the restrict-properties-to-role feature (see before-hook.ts for the
// backend half). Hides any edit-form field tagged `custom: { role: '<role>' }` in the
// resource's property options unless the logged-in admin has that exact role.
const RoleRestrictedEditAction: FC<ActionProps> = (props) => {
  const [currentAdmin] = useCurrentAdmin();

  const newProps = {
    ...props,
    action: { ...props.action, component: undefined },
    resource: {
      ...props.resource,
      editProperties: props.resource.editProperties.filter((property) => {
        const requiredRole = property.custom?.role as string | undefined;
        return !requiredRole || requiredRole === currentAdmin?.role;
      }),
    },
  };

  return <BaseActionComponent {...newProps} />;
};

export default RoleRestrictedEditAction;
