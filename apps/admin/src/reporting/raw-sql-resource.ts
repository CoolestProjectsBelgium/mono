import { BaseProperty, BaseRecord, BaseResource } from 'adminjs';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../database.js';

export interface RawSqlColumn {
  path: string;
  type?:
    | 'string'
    | 'float'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'mixed'
    | 'textarea';
  isId?: boolean;
}

export interface RawSqlResourceConfig {
  /** Unique resource id, used in AdminJS routes/urls */
  resourceId: string;
  /** Sidebar/db grouping label shown above the resource name */
  databaseName?: string;
  /**
   * The report query, exactly as you'd hand it to sequelize.query — any SELECT,
   * including joins, CTEs and window functions. It is used as a derived table, so it
   * must not end in a semicolon and should not itself contain LIMIT/ORDER BY tied to
   * outer pagination.
   */
  sql: string;
  /** Static replacements the query itself needs (e.g. :eventId) */
  replacements?: Record<string, unknown>;
  /** Lightweight column list — no Sequelize model/migration required */
  columns: RawSqlColumn[];
  /** Column used to identify a single row (findOne/findMany/sorting fallback) */
  primaryKey: string;
}

interface FilterElement {
  path: string;
  value: string | { from?: string; to?: string };
}

const buildWhere = (
  filter: unknown,
  baseReplacements: Record<string, unknown>,
) => {
  const clauses: string[] = [];
  const replacements: Record<string, unknown> = { ...baseReplacements };
  const elements = Object.values(
    (filter as { filters?: Record<string, FilterElement> })?.filters ?? {},
  );

  elements.forEach((element, index) => {
    const column = `\`${element.path}\``;
    const { value } = element;

    if (value && typeof value === 'object') {
      if (value.from) {
        const key = `f${index}_from`;
        clauses.push(`${column} >= :${key}`);
        replacements[key] = value.from;
      }
      if (value.to) {
        const key = `f${index}_to`;
        clauses.push(`${column} <= :${key}`);
        replacements[key] = value.to;
      }
    } else if (value !== undefined && value !== '') {
      const key = `f${index}`;
      clauses.push(`${column} = :${key}`);
      replacements[key] = value;
    }
  });

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    replacements,
  };
};

/**
 * Wraps an arbitrary read-only SQL SELECT (run via the shared `sequelize` connection from
 * database.ts — never a separate DB connection) as an AdminJS resource, without requiring a
 * real Sequelize Model or a database VIEW/migration. Filtering, sorting and pagination are all
 * still delegated to the database by wrapping the query as a derived table:
 *
 *   SELECT * FROM (<sql>) AS report_data WHERE ... ORDER BY ... LIMIT ... OFFSET ...
 *
 * This resource is read-only by design (create/update/delete throw); gate the `new`/`edit`/
 * `delete`/`bulkDelete` actions off in the resource's `options.actions` as well, so the UI
 * doesn't even offer them.
 */
export class RawSqlResource extends BaseResource {
  private cfg: RawSqlResourceConfig;

  constructor(cfg: RawSqlResourceConfig) {
    super(cfg);
    this.cfg = cfg;
  }

  databaseName() {
    return this.cfg.databaseName ?? 'Reporting';
  }

  databaseType() {
    return 'reporting';
  }

  id() {
    return this.cfg.resourceId;
  }

  properties(): BaseProperty[] {
    return this.cfg.columns.map(
      (column, position) =>
        new BaseProperty({
          path: column.path,
          type: column.type ?? 'string',
          isId: column.isId ?? false,
          position,
        }),
    );
  }

  property(path: string): BaseProperty | null {
    return (
      this.properties().find((property) => property.path() === path) ?? null
    );
  }

  private derivedTable() {
    return `(${this.cfg.sql}) AS report_data`;
  }

  async count(filter: unknown): Promise<number> {
    const { where, replacements } = buildWhere(
      filter,
      this.cfg.replacements ?? {},
    );
    const rows = (await sequelize.query(
      `SELECT COUNT(*) AS total FROM ${this.derivedTable()} ${where}`,
      { type: QueryTypes.SELECT, replacements },
    )) as Array<{ total: number }>;

    return Number(rows[0]?.total ?? 0);
  }

  async find(
    filter: unknown,
    options: {
      limit?: number;
      offset?: number;
      sort?: { sortBy?: string; direction?: 'asc' | 'desc' };
    },
  ): Promise<BaseRecord[]> {
    const { where, replacements } = buildWhere(
      filter,
      this.cfg.replacements ?? {},
    );
    const knownColumns = new Set(this.cfg.columns.map((column) => column.path));
    const sortBy =
      options.sort?.sortBy && knownColumns.has(options.sort.sortBy)
        ? options.sort.sortBy
        : this.cfg.primaryKey;
    const direction = options.sort?.direction === 'desc' ? 'DESC' : 'ASC';

    const rows = await sequelize.query(
      `SELECT * FROM ${this.derivedTable()} ${where} ORDER BY \`${sortBy}\` ${direction} LIMIT :limit OFFSET :offset`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          ...replacements,
          limit: options.limit ?? 20,
          offset: options.offset ?? 0,
        },
      },
    );

    return rows.map(
      (row) => new BaseRecord(row as Record<string, unknown>, this),
    );
  }

  async findOne(id: string): Promise<BaseRecord | null> {
    const rows = await sequelize.query(
      `SELECT * FROM ${this.derivedTable()} WHERE \`${this.cfg.primaryKey}\` = :id`,
      {
        type: QueryTypes.SELECT,
        replacements: { ...(this.cfg.replacements ?? {}), id },
      },
    );

    return rows[0] ? new BaseRecord(rows[0], this) : null;
  }

  async findMany(ids: Array<string | number>): Promise<BaseRecord[]> {
    if (ids.length === 0) return [];

    const rows = await sequelize.query(
      `SELECT * FROM ${this.derivedTable()} WHERE \`${this.cfg.primaryKey}\` IN (:ids)`,
      {
        type: QueryTypes.SELECT,
        replacements: { ...(this.cfg.replacements ?? {}), ids },
      },
    );

    return rows.map(
      (row) => new BaseRecord(row as Record<string, unknown>, this),
    );
  }

  build(params: Record<string, unknown>): BaseRecord {
    return new BaseRecord(params, this);
  }

  async create(): Promise<never> {
    throw new Error(`Resource "${this.id()}" is read-only.`);
  }

  async update(): Promise<never> {
    throw new Error(`Resource "${this.id()}" is read-only.`);
  }

  async delete(): Promise<void> {
    throw new Error(`Resource "${this.id()}" is read-only.`);
  }
}
