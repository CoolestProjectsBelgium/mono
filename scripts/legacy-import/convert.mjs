#!/usr/bin/env node
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractVotingSchema, looksLikeFullAzureDump } from './mappers/extract-voting.mjs';
import { mapEvent } from './mappers/event.mjs';
import { mapUser } from './mappers/user.mjs';
import { mapProject } from './mappers/project.mjs';
import { mapUserProjects } from './mappers/user-project.mjs';
import { mapAccount } from './mappers/account.mjs';
import { mapAttachment, sizeByAttachmentId } from './mappers/attachment.mjs';
import { mapAward } from './mappers/award.mjs';
import { mapAssignedTables } from './mappers/table.mjs';
import { hyperlinksByProjectId } from './mappers/hyperlink.mjs';
import {
  mapQuestion,
  mapQuestionTranslation,
  mapQuestionUser,
} from './mappers/question.mjs';
import {
  mapTshirt,
  mapTshirtGroup,
  mapTshirtGroupTranslation,
  mapTshirtTranslation,
} from './mappers/tshirt.mjs';
import {
  mapCertificate,
  mapMessage,
  mapVote,
  mapVoteCategory,
} from './mappers/vote.mjs';

const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize-typescript');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const COMPOSE_FILE = path.join(HERE, 'docker-compose.yml');
const FIXTURE = path.join(HERE, 'fixtures/legacy-mini.sql');
const DEFAULT_OUTPUT = path.join(HERE, 'out/converted.sql');

function parseArgs(argv) {
  const args = { fixture: false, up: false, dump: process.env.LEGACY_DUMP, output: process.env.OUTPUT || DEFAULT_OUTPUT };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fixture') args.fixture = true;
    else if (arg === '--up') args.up = true;
    else if (arg === '--dump') args.dump = argv[++i];
    else if (arg === '--output') args.output = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

function dbConfig() {
  return {
    host: process.env.LEGACY_IMPORT_HOST || '127.0.0.1',
    port: Number(process.env.LEGACY_IMPORT_PORT || 3307),
    user: process.env.LEGACY_IMPORT_USER || 'root',
    password: process.env.LEGACY_IMPORT_PASSWORD || 'legacy',
  };
}

function loadDatabaseModels() {
  try {
    return require('@coolestprojects/database');
  } catch (error) {
    throw new Error(
      'Build the database package first: npm run build --workspace=packages/database',
      { cause: error },
    );
  }
}

async function waitForMysql(config) {
  let lastError;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const conn = await mysql.createConnection({ ...config, connectTimeout: 2000 });
      await conn.query('SELECT 1');
      await conn.end();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(
    `MySQL is not reachable at ${config.host}:${config.port}. Start it with: docker compose -f scripts/legacy-import/docker-compose.yml up -d`,
    { cause: lastError },
  );
}

function startCompose() {
  const result = spawnSync(
    'docker',
    ['compose', '-f', COMPOSE_FILE, 'up', '-d'],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error('docker compose up failed');
  }
}

async function resetDatabases(conn) {
  await conn.query(`
    DROP DATABASE IF EXISTS legacy;
    DROP DATABASE IF EXISTS target;
    CREATE DATABASE legacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE target CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
}

async function loadSql(conn, sql) {
  await conn.query(sql);
}

async function tableExists(conn, schema, table) {
  const [rows] = await conn.query(
    'SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [schema, table],
  );
  return rows.length > 0;
}

async function selectAll(conn, table) {
  if (!(await tableExists(conn, 'legacy', table))) return [];
  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  return rows;
}

async function insert(model, rows, label) {
  if (!rows.length) {
    console.log(`  ${label}: 0`);
    return;
  }
  await model.bulkCreate(rows, { validate: false, hooks: false });
  console.log(`  ${label}: ${rows.length}`);
}

function targetSequelize(config, models) {
  return new Sequelize({
    dialect: 'mysql',
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    database: 'target',
    logging: false,
    models: [
      models.Event,
      models.Account,
      models.AdminSession,
      models.Affiliation,
      models.Municipality,
      models.TshirtGroup,
      models.Tshirt,
      models.TshirtTranslation,
      models.TshirtGroupTranslation,
      models.Question,
      models.QuestionTranslation,
      models.QuestionUser,
      models.QuestionRegistration,
      models.User,
      models.Project,
      models.UserProject,
      models.Registration,
      models.EventTable,
      models.Attachment,
      models.VoteCategory,
      models.Vote,
      models.Award,
      models.Certificate,
      models.Message,
      models.EmailTemplate,
      models.EmailLog,
    ],
  });
}

export async function convertLegacy(conn, models) {
  const events = await selectAll(conn, 'events');
  const accounts = await selectAll(conn, 'accounts');
  const tshirtGroups = await selectAll(conn, 'tshirtgroups');
  const tshirts = await selectAll(conn, 'tshirts');
  const tshirtTranslations = await selectAll(conn, 'tshirttranslations');
  const tshirtGroupTranslations = await selectAll(conn, 'tshirtgrouptranslations');
  const users = await selectAll(conn, 'users');
  const projects = await selectAll(conn, 'projects');
  const vouchers = await selectAll(conn, 'vouchers');
  const questions = await selectAll(conn, 'questions');
  const questionTranslations = await selectAll(conn, 'questiontranslations');
  const questionUsers = await selectAll(conn, 'questionusers');
  const attachments = await selectAll(conn, 'attachments');
  const blobs = await selectAll(conn, 'azureblobs');
  const hyperlinks = await selectAll(conn, 'hyperlinks');
  const voteCategories = await selectAll(conn, 'votecategories');
  const votes = await selectAll(conn, 'votes');
  const awards = await selectAll(conn, 'awards');
  const certificates = await selectAll(conn, 'certificates');
  const messages = await selectAll(conn, 'messages');
  const tables = await selectAll(conn, 'tables');
  const projectTables = await selectAll(conn, 'projecttables');

  const folderByEvent = new Map(events.map((event) => [event.id, event.azure_storage_container]));
  const urlsByProject = hyperlinksByProjectId(hyperlinks, attachments);
  const sizes = sizeByAttachmentId(blobs);

  await conn.query('USE target');
  await conn.query('SET FOREIGN_KEY_CHECKS=0');

  await insert(models.Event, events.map(mapEvent), 'Events');
  await insert(models.Account, accounts.map(mapAccount), 'Accounts');
  await insert(models.TshirtGroup, tshirtGroups.map(mapTshirtGroup), 'TshirtGroups');
  await insert(models.Tshirt, tshirts.map(mapTshirt), 'Tshirts');
  await insert(models.TshirtTranslation, tshirtTranslations.map(mapTshirtTranslation), 'TshirtTranslations');
  await insert(
    models.TshirtGroupTranslation,
    tshirtGroupTranslations.map(mapTshirtGroupTranslation),
    'TshirtGroupTranslations',
  );
  await insert(models.Question, questions.map(mapQuestion), 'Questions');
  await insert(
    models.QuestionTranslation,
    questionTranslations.map(mapQuestionTranslation),
    'QuestionTranslations',
  );
  await insert(models.User, users.map(mapUser), 'Users');
  await insert(
    models.Project,
    projects.map((project) => mapProject(project, urlsByProject.get(project.id) || [])),
    'Projects',
  );
  await insert(models.UserProject, mapUserProjects(projects, vouchers), 'UserProjects');
  await insert(models.QuestionUser, questionUsers.map(mapQuestionUser), 'QuestionUsers');
  await insert(
    models.Attachment,
    attachments.map((row) =>
      mapAttachment(row, {
        folderName: folderByEvent.get(row.EventId ?? row.eventId) || 'unknown',
        size: sizes.get(row.id) || 0,
      }),
    ),
    'Attachments',
  );
  await insert(models.VoteCategory, voteCategories.map(mapVoteCategory), 'VoteCategories');
  await insert(models.Vote, votes.map(mapVote), 'Votes');
  await insert(models.Award, awards.map(mapAward), 'Awards');
  await insert(models.Certificate, certificates.map(mapCertificate), 'Certificates');
  await insert(models.Message, messages.map(mapMessage), 'Messages');
  await insert(models.EventTable, mapAssignedTables(projectTables, tables), 'Tables');

  await conn.query('SET FOREIGN_KEY_CHECKS=1');
}

export async function verifyFixture(models) {
  const event = await models.Event.findByPk(1);
  if (!event || event.eventTitle !== 'Coolest Projects 2021') {
    throw new Error('Expected Event 1 title Coolest Projects 2021');
  }
  const project = await models.Project.findByPk(1);
  if (!project || project.name !== 'Robot Cat') {
    throw new Error('Expected Project 1 name Robot Cat');
  }
  if (!String(project.internalInformation).includes('https://youtu.be/abc123')) {
    throw new Error('Expected YouTube URL on project internalInformation');
  }
  if (!String(project.internalInformation).includes('keep this note')) {
    throw new Error('Expected original internal info to be kept');
  }
  const users = await models.User.findAll({ order: [['id', 'ASC']] });
  if (users.length !== 2) throw new Error(`Expected 2 users, got ${users.length}`);
  if (users[0].via_type !== 'other' || users[1].via_type !== null) {
    throw new Error('via_type mapping failed');
  }
  const memberships = await models.UserProject.findAll();
  if (memberships.length !== 3) {
    throw new Error(`Expected 3 UserProjects, got ${memberships.length}`);
  }
  if (memberships.filter((row) => row.isOwner).length !== 1) {
    throw new Error('Expected exactly one owner UserProject');
  }
  const account = await models.Account.findByPk(1);
  if (!account || account.encryptedPassword != null) {
    throw new Error('Expected account encryptedPassword to be null');
  }
  const attachment = await models.Attachment.findByPk(1);
  if (!attachment || attachment.filepath !== 'coolestproject/project_1/cat.jpg' || attachment.size !== 4096) {
    throw new Error('Attachment metadata mapping failed');
  }
  const tableCount = await models.EventTable.count();
  if (tableCount !== 1) throw new Error(`Expected 1 assigned table, got ${tableCount}`);
  const award = await models.Award.findByPk(1);
  if (!award || award.text !== '') throw new Error('Award text should be empty');
  const voteCount = await models.Vote.count();
  if (voteCount !== 1) throw new Error('Expected 1 jury vote');
  console.log('Fixture verification passed (event + project readable by Sequelize / AdminJS models).');
}

const DUMP_TABLE_ORDER = [
  'Events',
  'Accounts',
  'admin_sessions',
  'TshirtGroups',
  'Tshirts',
  'TshirtTranslations',
  'TshirtGroupTranslations',
  'Questions',
  'QuestionTranslations',
  'Users',
  'Projects',
  'UserProjects',
  'Registrations',
  'QuestionUsers',
  'QuestionRegistrations',
  'Tables',
  'Attachments',
  'VoteCategories',
  'Votes',
  'Awards',
  'Certificates',
  'Messages',
  'EmailTemplates',
  'EmailLogs',
  'Affiliations',
  'Municipalities',
];

function sqlLiteral(conn, value) {
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (
    Array.isArray(value) ||
    (value != null &&
      typeof value === 'object' &&
      !(value instanceof Date) &&
      !Buffer.isBuffer(value))
  ) {
    return conn.escape(JSON.stringify(value));
  }
  return conn.escape(value);
}

async function dumpTarget(conn, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await conn.query('USE target');
  const [tableRows] = await conn.query(
    `SELECT TABLE_NAME AS name
     FROM information_schema.tables
     WHERE table_schema = 'target' AND table_type = 'BASE TABLE'`,
  );
  const present = tableRows.map((row) => row.name);
  const presentLower = new Map(present.map((name) => [name.toLowerCase(), name]));
  const ordered = [];
  for (const wanted of DUMP_TABLE_ORDER) {
    const actual = presentLower.get(wanted.toLowerCase());
    if (actual) ordered.push(actual);
  }
  for (const name of present.sort()) {
    if (!ordered.includes(name)) ordered.push(name);
  }
  const chunks = [
    '-- Converted Coolest Projects schema (utf8mb4)',
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS=0;',
    'SET UNIQUE_CHECKS=0;',
    "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';",
    '',
  ];
  for (const name of ordered) {
    const [createRows] = await conn.query(`SHOW CREATE TABLE \`${name}\``);
    const createSql = createRows[0]['Create Table'];
    chunks.push(`DROP TABLE IF EXISTS \`${name}\`;`);
    chunks.push(`${createSql};`);
    chunks.push('');
    const [rows] = await conn.query(`SELECT * FROM \`${name}\``);
    if (rows.length === 0) continue;
    const cols = Object.keys(rows[0]);
    const colList = cols.map((col) => `\`${col}\``).join(', ');
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const values = batch.map((row) => {
        const inner = cols.map((col) => sqlLiteral(conn, row[col])).join(', ');
        return `(${inner})`;
      });
      chunks.push(`INSERT INTO \`${name}\` (${colList}) VALUES`);
      chunks.push(`${values.join(',\n')};`);
      chunks.push('');
    }
  }
  chunks.push('SET FOREIGN_KEY_CHECKS=1;');
  chunks.push('SET UNIQUE_CHECKS=1;');
  const sql = `${chunks.join('\n')}\n`;
  fs.writeFileSync(outputPath, sql);
  console.log(`Wrote ${outputPath} (${sql.length} bytes)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node scripts/legacy-import/convert.mjs [--fixture] [--up] [--dump file.sql] [--output file.sql]

  --fixture   Load the anonymized mini dump (default if --dump / LEGACY_DUMP unset)
  --up        docker compose up -d before converting
  --dump      Path to azure_backup_*.sql (or set LEGACY_DUMP)
  --output    mysqldump destination (default scripts/legacy-import/out/converted.sql)
`);
    return;
  }

  const dumpPath = args.dump;
  const useFixture = args.fixture || !dumpPath;
  const sourcePath = useFixture ? FIXTURE : path.resolve(dumpPath);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Dump not found: ${sourcePath}`);
  }

  if (args.up) startCompose();

  const config = dbConfig();
  await waitForMysql(config);

  const models = loadDatabaseModels();
  const conn = await mysql.createConnection({ ...config, multipleStatements: true });
  try {
    console.log(`Loading ${useFixture ? 'fixture' : sourcePath} into legacy…`);
    let sql = fs.readFileSync(sourcePath, 'utf8');
    if (looksLikeFullAzureDump(sql)) {
      sql = extractVotingSchema(sql);
      console.log('Extracted `voting` schema (mysql/archief/views dropped).');
    }
    await resetDatabases(conn);
    await loadSql(conn, sql);

    const sequelize = targetSequelize(config, models);
    await sequelize.sync({ force: true });
    console.log('Target schema synced from Sequelize models.');
    await convertLegacy(conn, models);
    if (useFixture) {
      await verifyFixture(models);
    }
    await dumpTarget(conn, path.resolve(args.output));
    await sequelize.close();
  } finally {
    await conn.end();
  }
  console.log('Done. Do not start the API against this dump until Event 7 exists (InfoInterceptor: No Active Event).');
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
