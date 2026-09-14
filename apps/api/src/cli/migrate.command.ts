import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Command } from 'nestjs-command';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';

// Resolved via require.resolve() rather than a relative `../../..` walk so
// this doesn't care how deep npm workspaces hoists @coolestprojects/database.
// apps/api compiles to CommonJS, so `require` is already in scope here.
function migrationsGlob(): string {
  const dbPackageJson = require.resolve('@coolestprojects/database/package.json');
  return path.join(path.dirname(dbPackageJson), 'dist/migrations/*.js');
}

@Injectable()
export class MigrateCommand {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  private buildUmzug() {
    return new Umzug({
      migrations: { glob: migrationsGlob() },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: console,
    });
  }

  @Command({
    command: 'db:migrate',
    describe: 'Run pending database migrations',
  })
  async migrate() {
    const applied = await this.buildUmzug().up();
    console.log(
      applied.length
        ? `Applied ${applied.length} migration(s): ${applied.map((m) => m.name).join(', ')}`
        : 'No pending migrations.',
    );
  }

  @Command({
    command: 'db:migrate:undo',
    describe: 'Revert the most recently applied migration',
  })
  async undo() {
    const reverted = await this.buildUmzug().down();
    console.log(
      reverted.length
        ? `Reverted: ${reverted.map((m) => m.name).join(', ')}`
        : 'Nothing to revert.',
    );
  }

  @Command({
    command: 'db:migrate:status',
    describe: 'List executed and pending migrations',
  })
  async status() {
    const umzug = this.buildUmzug();
    const [executed, pending] = await Promise.all([
      umzug.executed(),
      umzug.pending(),
    ]);
    console.log(`Executed (${executed.length}):`);
    executed.forEach((m) => console.log(`  ${m.name}`));
    console.log(`Pending (${pending.length}):`);
    pending.forEach((m) => console.log(`  ${m.name}`));
  }
}
