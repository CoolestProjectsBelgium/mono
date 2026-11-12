import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildWhere } from './raw-sql-where.js';

const columns = new Set(['email', 'createdAt', 'total']);
const filterOf = (
  ...elements: Array<{ path: string; value: unknown }>
): unknown => ({
  filters: Object.fromEntries(elements.map((e, i) => [`k${i}`, e])),
});

test('no filter yields an empty clause and keeps the base replacements', () => {
  assert.deepEqual(buildWhere(undefined, { eventId: 3 }, columns), {
    where: '',
    replacements: { eventId: 3 },
  });
  assert.equal(buildWhere({ filters: {} }, {}, columns).where, '');
});

test('equality filters become named replacements, never inline values', () => {
  const result = buildWhere(
    filterOf({ path: 'email', value: "x' OR '1'='1" }),
    { eventId: 3 },
    columns,
  );
  assert.equal(result.where, 'WHERE `email` = :f0');
  assert.deepEqual(result.replacements, {
    eventId: 3,
    f0: "x' OR '1'='1",
  });
});

test('range filters support from, to, or both', () => {
  const both = buildWhere(
    filterOf({
      path: 'createdAt',
      value: { from: '2026-01-01', to: '2026-02-01' },
    }),
    {},
    columns,
  );
  assert.equal(
    both.where,
    'WHERE `createdAt` >= :f0_from AND `createdAt` <= :f0_to',
  );
  assert.deepEqual(both.replacements, {
    f0_from: '2026-01-01',
    f0_to: '2026-02-01',
  });

  const fromOnly = buildWhere(
    filterOf({ path: 'createdAt', value: { from: '2026-01-01' } }),
    {},
    columns,
  );
  assert.equal(fromOnly.where, 'WHERE `createdAt` >= :f0_from');
});

test('multiple filters are joined with AND and empty values are skipped', () => {
  const result = buildWhere(
    filterOf(
      { path: 'email', value: 'a@example.be' },
      { path: 'total', value: '' },
      { path: 'total', value: '5' },
    ),
    {},
    columns,
  );
  assert.equal(result.where, 'WHERE `email` = :f0 AND `total` = :f2');
  assert.deepEqual(result.replacements, { f0: 'a@example.be', f2: '5' });
});

test('filters on columns the report does not declare are ignored', () => {
  const result = buildWhere(
    filterOf(
      { path: 'email` = 1 OR 1=1 -- ', value: 'x' },
      { path: 'password', value: 'x' },
      { path: 'email', value: 'a@example.be' },
    ),
    {},
    columns,
  );
  assert.equal(result.where, 'WHERE `email` = :f2');
  assert.deepEqual(result.replacements, { f2: 'a@example.be' });
});
