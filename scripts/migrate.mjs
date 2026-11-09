import {readdirSync, readFileSync, existsSync} from 'node:fs';
import {getDatabase} from '../server/database.js';

export async function migrate(db = getDatabase()) {
  if (db.isPostgres) {
    await db.client.execute(
      'CREATE TABLE IF NOT EXISTS public.agro_migrations (name text PRIMARY KEY, applied_at bigint NOT NULL)'
    );
    const dir = 'supabase/migrations';
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).filter(n => n.endsWith('.sql')).sort()) {
      const found = await db.client.execute({
        sql: 'SELECT name FROM public.agro_migrations WHERE name = ?',
        args: [name]
      });
      if (found.rows.length) continue;
      const sql = readFileSync(dir + '/' + name, 'utf8');
      await db.client.batch([
        sql,
        {
          sql: 'INSERT INTO public.agro_migrations(name, applied_at) VALUES (?, ?)',
          args: [name, Date.now()]
        }
      ]);
      console.log('Applied Supabase Postgres migration ' + name);
    }
    return;
  }

  await db.client.execute(
    'CREATE TABLE IF NOT EXISTS agro_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)'
  );
  for (const name of readdirSync('drizzle').filter(n => /^\d+.*\.sql$/.test(n)).sort()) {
    const found = await db.client.execute({
      sql: 'SELECT name FROM agro_migrations WHERE name=?',
      args: [name]
    });
    if (found.rows.length) continue;
    const statements = readFileSync('drizzle/' + name, 'utf8')
      .split('--> statement-breakpoint')
      .flatMap(s => s.split(';'))
      .map(s => s.trim())
      .filter(Boolean);
    await db.client.batch(
      [
        ...statements,
        {
          sql: 'INSERT INTO agro_migrations(name,applied_at) VALUES (?,?)',
          args: [name, Date.now()]
        }
      ],
      'write'
    );
    console.log('Applied ' + name);
  }
}

if (process.argv[1]?.endsWith('migrate.mjs')) {
  await migrate();
  await getDatabase().client.close();
}
