import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  andAccess,
  canAccessResourceFieldFilter,
  canAccessResourceFieldMatch,
  canAccessResourceRoleFilter,
  canCreate,
  filterEventId,
  filterUnlessRole,
  orAccess,
} from './authorisations.js';

const admin = { role: 'admin', eventId: 7, id: 42 };
const superAdmin = { role: 'super_admin', eventId: 7, id: 1 };

test('filterEventId forces the admin event onto query filters and payload', async () => {
  const request = {
    query: { page: 2, filters: { name: 'x', eventId: 999 } },
    payload: { name: 'y', eventId: 999 },
  };
  const result = await filterEventId('eventId')(request, {
    currentAdmin: admin,
  });

  assert.deepEqual(result.query, {
    page: 2,
    filters: { name: 'x', eventId: 7 },
  });
  assert.deepEqual(result.payload, { name: 'y', eventId: 7 });
});

test('filterEventId adds the filter when the request has none and leaves a missing payload alone', async () => {
  const result = await filterEventId('eventId')({}, { currentAdmin: admin });
  assert.deepEqual(result.query, { filters: { eventId: 7 } });
  assert.equal(result.payload, undefined);
});

test('filterUnlessRole lets the bypass role see everything', async () => {
  const request = { query: { filters: { email: 'a' } } };
  const hook = filterUnlessRole('id', (currentAdmin) => currentAdmin.id);

  assert.equal(await hook(request, { currentAdmin: superAdmin }), request);
  assert.deepEqual(
    (await hook(request, { currentAdmin: admin })).query.filters,
    { email: 'a', id: 42 },
  );
});

test('filterUnlessRole honours a custom bypass role', async () => {
  const hook = filterUnlessRole(
    'id',
    (currentAdmin) => currentAdmin.id,
    'admin',
  );
  const request = { query: {} };
  assert.equal(await hook(request, { currentAdmin: admin }), request);
  assert.deepEqual(
    (await hook(request, { currentAdmin: superAdmin })).query.filters,
    { id: 1 },
  );
});

test('canCreate: super_admin always, admin only with an event and never for accounts', () => {
  assert.equal(
    canCreate({ currentAdmin: superAdmin, resource: { id: 'Account' } }),
    true,
  );
  assert.equal(
    canCreate({ currentAdmin: admin, resource: { id: 'Project' } }),
    true,
  );
  assert.equal(
    canCreate({ currentAdmin: admin, resource: { id: 'Account' } }),
    false,
  );
  assert.equal(
    canCreate({ currentAdmin: { role: 'admin' }, resource: { id: 'Project' } }),
    false,
  );
  assert.equal(
    canCreate({
      currentAdmin: { role: 'jury', eventId: 7 },
      resource: { id: 'Project' },
    }),
    false,
  );
});

test('canAccessResourceFieldFilter only allows records of the admin event', () => {
  const access = canAccessResourceFieldFilter('eventId');
  assert.equal(
    access({ currentAdmin: admin, record: { params: { eventId: 7 } } }),
    true,
  );
  assert.equal(
    access({ currentAdmin: admin, record: { params: { eventId: 8 } } }),
    false,
  );
  assert.equal(access({ currentAdmin: admin, record: { params: {} } }), false);
});

test('canAccessResourceFieldMatch compares a record field with an admin field', () => {
  const access = canAccessResourceFieldMatch('id', 'id');
  assert.equal(
    access({ currentAdmin: admin, record: { params: { id: '42' } } }),
    true,
  );
  assert.equal(
    access({ currentAdmin: admin, record: { params: { id: 43 } } }),
    false,
  );
  // A missing value on either side must never match (e.g. "undefined" === "undefined").
  assert.equal(access({ currentAdmin: admin, record: { params: {} } }), false);
  assert.equal(
    access({ currentAdmin: admin, record: { params: { id: null } } }),
    false,
  );
  assert.equal(access({ currentAdmin: {}, record: undefined }), false);
});

test('role filter and and/or combinators', () => {
  const isSuper = canAccessResourceRoleFilter('super_admin');
  const ownEvent = canAccessResourceFieldFilter('eventId');
  const otherEventRecord = { params: { eventId: 8 } };

  assert.equal(isSuper({ currentAdmin: superAdmin }), true);
  assert.equal(isSuper({ currentAdmin: admin }), false);

  assert.equal(
    orAccess(
      isSuper,
      ownEvent,
    )({ currentAdmin: superAdmin, record: otherEventRecord }),
    true,
  );
  assert.equal(
    orAccess(
      isSuper,
      ownEvent,
    )({ currentAdmin: admin, record: otherEventRecord }),
    false,
  );
  assert.equal(
    andAccess(
      isSuper,
      ownEvent,
    )({ currentAdmin: superAdmin, record: otherEventRecord }),
    false,
  );
  assert.equal(
    andAccess(
      isSuper,
      ownEvent,
    )({
      currentAdmin: superAdmin,
      record: { params: { eventId: 7 } },
    }),
    true,
  );
});
