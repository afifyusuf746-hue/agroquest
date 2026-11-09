import {createClient} from '@libsql/client';
import {mkdirSync} from 'node:fs';
import pg from 'pg';

const {Pool, types} = pg;
// Parse Postgres BIGINT (OID 20) as safe JS Numbers to match SQLite integer semantics
types.setTypeParser(20, val => (val === null ? null : Number(val)));

let cached;

export function toPostgresSql(sql) {
  let out = sql.trim().replace(/;$/, '');
  if (/^INSERT\s+OR\s+IGNORE\s+INTO\b/i.test(out)) {
    out = out.replace(/^INSERT\s+OR\s+IGNORE\s+INTO\b/i, 'INSERT INTO') + ' ON CONFLICT DO NOTHING';
  }
  out = out.replace(/(\b[\w.]+\b)\s+COLLATE\s+NOCASE\b/gi, 'LOWER($1)');
  let idx = 0;
  out = out.replace(/\?/g, () => '$' + (++idx));
  return out;
}

export function adaptPostgres(pool) {
  const result = r => ({meta: {changes: Number(r.rowCount || 0)}});
  return {
    isPostgres: true,
    client: {
      async execute(stmt) {
        if (typeof stmt === 'string') return pool.query(stmt);
        return pool.query(toPostgresSql(stmt.sql), stmt.args || []);
      },
      async batch(statements) {
        const conn = await pool.connect();
        try {
          await conn.query('BEGIN');
          const out = [];
          for (const s of statements) {
            if (typeof s === 'string') out.push(await conn.query(s));
            else out.push(await conn.query(toPostgresSql(s.sql), s.args || []));
          }
          await conn.query('COMMIT');
          return out;
        } catch (e) {
          await conn.query('ROLLBACK');
          throw e;
        } finally {
          conn.release();
        }
      },
      async close() {
        await pool.end();
      }
    },
    prepare(sql) {
      const pgSql = toPostgresSql(sql);
      return {
        bind(...args) {
          const statement = {sql: pgSql, args};
          return {
            ...statement,
            async run() {
              return result(await pool.query(pgSql, args));
            },
            async first() {
              const r = await pool.query(pgSql, args);
              return r.rows[0] || null;
            },
            async all() {
              const r = await pool.query(pgSql, args);
              return {results: r.rows};
            }
          };
        }
      };
    },
    async batch(statements) {
      const conn = await pool.connect();
      try {
        await conn.query('BEGIN');
        const out = [];
        for (const {sql, args} of statements) {
          out.push(result(await conn.query(sql, args)));
        }
        await conn.query('COMMIT');
        return out;
      } catch (e) {
        await conn.query('ROLLBACK');
        throw e;
      } finally {
        conn.release();
      }
    }
  };
}

export function adaptClient(client) {
  const plain = r => Object.fromEntries(r.columns.map((col, i) => [col, r.rows[0]?.[i]]));
  const result = r => ({meta: {changes: Number(r.rowsAffected)}});
  return {
    isPostgres: false,
    client,
    prepare(sql) {
      return {
        bind(...args) {
          const statement = {sql, args};
          return {
            ...statement,
            async run() {
              return result(await client.execute(statement));
            },
            async first() {
              const r = await client.execute(statement);
              return r.rows.length ? plain(r) : null;
            },
            async all() {
              const r = await client.execute(statement);
              return {
                results: r.rows.map(row =>
                  Object.fromEntries(r.columns.map((c, i) => [c, row[i]]))
                )
              };
            }
          };
        }
      };
    },
    async batch(statements) {
      return (
        await client.batch(
          statements.map(({sql, args}) => ({sql, args})),
          'write'
        )
      ).map(result);
    }
  };
}

export function getDatabase(env = process.env) {
  if (cached) return cached;
  const pgUrl = env.SUPABASE_DB_URL || env.DATABASE_URL || env.POSTGRES_URL || (env.TURSO_DATABASE_URL?.startsWith('postgres') ? env.TURSO_DATABASE_URL : '');
  if (pgUrl) {
    const pool = new Pool({
      connectionString: pgUrl,
      max: Number(env.PG_POOL_MAX) || 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1') ? false : {rejectUnauthorized: false}
    });
    cached = adaptPostgres(pool);
    return cached;
  }
  let url = env.TURSO_DATABASE_URL;
  if (!url) {
    if (env.VERCEL) {
      throw Error('Konfigurasi SUPABASE_DB_URL (atau TURSO_DATABASE_URL) diperlukan dalam mode standalone Vercel.');
    }
    mkdirSync('data', {recursive: true});
    url = 'file:./data/agroquest.db';
  }
  if (env.VERCEL && url.startsWith('file:')) {
    throw Error('File SQLite lokal tidak digunakan sebagai penyimpanan Vercel.');
  }
  const client = createClient({url, authToken: env.TURSO_AUTH_TOKEN || undefined});
  cached = adaptClient(client);
  return cached;
}
