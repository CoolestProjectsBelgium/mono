// Runs against the compiled package (dist/), i.e. exactly what api/admin import.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Sequelize, Model } = require('sequelize-typescript');
const database = require('../dist/index.js');

const modelClasses = Object.values(database).filter(
  (value) => typeof value === 'function' && value.prototype instanceof Model,
);

// No connection is opened: Sequelize only connects on the first query.
const sequelize = new Sequelize({
  dialect: 'mysql',
  logging: false,
  models: modelClasses,
});

const validationPaths = async (instance) => {
  try {
    await instance.validate();
    return [];
  } catch (error) {
    return error.errors.map((item) => item.path);
  }
};

test('index exports every model file', () => {
  const modelFiles = fs
    .readdirSync(path.join(__dirname, '../src/models'))
    // base_event is an abstract parent, not a table of its own.
    .filter((file) => file.endsWith('.model.ts') && file !== 'base_event.model.ts');
  const index = fs.readFileSync(path.join(__dirname, '../src/index.ts'), 'utf8');
  const missing = modelFiles.filter(
    (file) => !index.includes(`./models/${file.replace(/\.ts$/, '')}'`),
  );
  assert.deepEqual(missing, []);
});

test('all models register together and resolve their associations', () => {
  assert.ok(modelClasses.length >= 30, `only ${modelClasses.length} models found`);
  for (const model of modelClasses) {
    assert.ok(sequelize.models[model.name], `${model.name} is not registered`);
  }
  assert.equal(database.User.associations.event.target, database.Event);
  assert.equal(database.Project.associations.event.target, database.Event);
  assert.equal(database.Vote.rawAttributes.projectId.references.model, 'Projects');
});

test('Account.hashPassword produces a salted bcrypt hash that verifyPassword accepts', () => {
  const hash = database.Account.hashPassword('correct horse');
  assert.match(hash, /^\$2[aby]\$12\$/);
  assert.notEqual(hash, database.Account.hashPassword('correct horse'));

  const account = database.Account.build({
    email: 'admin@example.be',
    encryptedPassword: hash,
    account_type: 'admin',
  });
  assert.equal(account.verifyPassword('correct horse'), true);
  assert.equal(account.verifyPassword('wrong'), false);
});

test('Account two-factor flags default to off', () => {
  const account = database.Account.build({ email: 'a@example.be' });
  assert.equal(account.twoFactorEnabled, false);
  assert.equal(account.twoFactorRequired, false);
});

test('User rejects malformed emails and out-of-range postal codes', async () => {
  const valid = {
    eventId: 1,
    language: 'nl',
    postalcode: 1000,
    email: 'kid@example.be',
    firstname: 'Jan',
    lastname: 'Peeters',
    sex: 'x',
  };
  const paths = await validationPaths(
    database.User.build({ ...valid, email: 'not-an-email', postalcode: 99 }),
  );
  assert.ok(paths.includes('email'));
  assert.ok(paths.includes('postalcode'));

  const okPaths = await validationPaths(database.User.build(valid));
  assert.ok(!okPaths.includes('email'));
  assert.ok(!okPaths.includes('postalcode'));
});

test('Registration.overdue follows the JWT_EXPIRES activation window', (t) => {
  const previous = process.env.JWT_EXPIRES;
  t.after(() => {
    if (previous === undefined) delete process.env.JWT_EXPIRES;
    else process.env.JWT_EXPIRES = previous;
  });

  const hour = 60 * 60 * 1000;
  const twoHoursOld = database.Registration.build({
    createdAt: new Date(Date.now() - 2 * hour),
  });

  process.env.JWT_EXPIRES = '1h';
  assert.equal(twoHoursOld.overdue, true);
  process.env.JWT_EXPIRES = '1d';
  assert.equal(twoHoursOld.overdue, false);
  // A bare number is a duration in milliseconds.
  process.env.JWT_EXPIRES = String(hour);
  assert.equal(twoHoursOld.overdue, true);
  // Unset or unparseable: never report overdue.
  process.env.JWT_EXPIRES = 'soon';
  assert.equal(twoHoursOld.overdue, false);
  delete process.env.JWT_EXPIRES;
  assert.equal(twoHoursOld.overdue, false);
});
