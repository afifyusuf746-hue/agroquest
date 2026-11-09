import {test} from 'node:test';import assert from 'node:assert/strict';import {createClient} from '@libsql/client';import {adaptClient,adaptPostgres,toPostgresSql} from '../server/database.js';import {migrate} from '../scripts/migrate.mjs';import {handleApi} from '../server/handler.js';import {hashPassword} from '../server/auth.js';
test('portable SQLite adapter, password login, protected reports, durable save, and 36-player cap',async()=>{const client=createClient({url:'file::memory:'}),db=adaptClient(client);await migrate(db);const env={AGRO_BACKEND_MODE:'local',TEACHER_EMAIL:'teacher@example.test',TEACHER_PASSWORD_HASH:hashPassword('Local-test-password-1234'),TEACHER_SESSION_SECRET:'test-secret-for-this-unit-test-only-1234567890'};
async function call(path,{body,token,cookie,headers={}}={}){const r=await handleApi(new Request('http://localhost:3000'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(cookie?{Cookie:cookie}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})}),{env,db});let data;try{data=await r.json()}catch{}return {status:r.status,data,headers:r.headers}}
assert.equal((await call('/api/teacher/rooms',{headers:{'oai-authenticated-user-email':env.TEACHER_EMAIL,'oai-authenticated-user-id':'forged'}})).status,401);assert.equal((await call('/api/auth/login',{body:{email:env.TEACHER_EMAIL,password:'wrong'}})).status,401);const logged=await call('/api/auth/login',{body:{email:env.TEACHER_EMAIL,password:'Local-test-password-1234'}});assert.equal(logged.status,200);const cookie=logged.headers.get('set-cookie').split(';')[0];assert.equal((await call('/api/teacher/me',{cookie})).status,200);assert.equal((await call('/api/teacher/me',{cookie:cookie+'tampered'})).status,401);
const room=(await call('/api/teacher/rooms',{cookie,body:{label:'Kelas Uji Lokal'}})).data.room;const joins=await Promise.all(Array.from({length:37},(_,i)=>call('/api/rooms/join',{body:{room,name:'Siswa '+(i+1)}})));assert.equal(joins.filter(r=>r.status===201).length,36);assert.equal(joins.filter(r=>r.status===409).length,1);const first=joins.find(r=>r.status===201).data;const saved=await call('/api/rooms/progress',{token:first.token,body:{room,revision:0,progress:{xp:30,coins:10,completed:[],learning:{k3:{read:true,best:3,attempts:1,reflection:'Saya memeriksa alat sebelum praktik.',tasks:[true,true,false,false]}}}}});assert.equal(saved.status,200);await call('/api/rooms/leave',{token:first.token,body:{room}});const report=await call('/api/teacher/report?room='+room,{cookie});assert.equal(report.status,200);assert.equal(report.data.students.length,36);assert.ok(report.data.students.some(s=>s.stats.score===3&&s.progress.learning.k3.reflection.includes('memeriksa alat')));const resumed=await call('/api/rooms/join',{body:{room,name:'Siswa 1',learnerToken:first.learnerToken}});assert.equal(resumed.status,201);assert.equal(resumed.data.learnerId,first.learnerId);assert.equal(resumed.data.priorProgress.learning.k3.best,3);const logout=await call('/api/auth/logout',{body:{}});assert.ok(logout.headers.get('set-cookie').includes('Max-Age=0'));client.close();console.log('Portable login, SQLite storage, forged-header protection, 36 slots and progress restore verified.');
});
test('Vercel proxy preserves room APIs, strips private cookies and redirects teacher to original backend',async()=>{const old=globalThis.fetch;let forwarded;globalThis.fetch=async(url,options)=>{forwarded={url,options};return Response.json({ok:true})};try{const response=await handleApi(new Request('https://class.vercel.app/api/handler?route=rooms/sync',{method:'POST',headers:{Origin:'https://class.vercel.app',Authorization:'Bearer student-session',Cookie:'private=do-not-forward'},body:JSON.stringify({room:'1234567890'})}),{env:{VERCEL:'1'}});assert.equal(response.status,200);assert.equal(forwarded.url,'https://agroquest-bansari-9nov.aceticscone8.chatgpt.site/api/rooms/sync');assert.equal(forwarded.options.headers.get('Origin'),'https://agroquest-bansari-9nov.aceticscone8.chatgpt.site');assert.equal(forwarded.options.headers.get('Cookie'),null);const teacher=await handleApi(new Request('https://class.vercel.app/api/handler?route=guru'),{env:{VERCEL:'1'}});assert.equal(teacher.status,302);assert.equal(teacher.headers.get('Location'),'https://agroquest-bansari-9nov.aceticscone8.chatgpt.site/guru');assert.equal((await handleApi(new Request('https://class.vercel.app/api/handler?route=teacher/report'),{env:{VERCEL:'1'}})).status,404)}finally{globalThis.fetch=old}});
test('Supabase Postgres adapter translates placeholders, INSERT OR IGNORE, COLLATE NOCASE, and transactions',async()=>{
  assert.equal(
    toPostgresSql('INSERT OR IGNORE INTO plots(room,slot) VALUES (?,?)'),
    'INSERT INTO plots(room,slot) VALUES ($1,$2) ON CONFLICT DO NOTHING'
  );
  assert.equal(
    toPostgresSql('SELECT * FROM enrollments e WHERE e.room=? ORDER BY e.display_name COLLATE NOCASE LIMIT 1000'),
    'SELECT * FROM enrollments e WHERE e.room=$1 ORDER BY LOWER(e.display_name) LIMIT 1000'
  );
  const queries = [];
  const fakePool = {
    async query(sql, args) {
      queries.push({sql, args});
      return {rowCount: 1, rows: [{code: 'ABCDEF1234'}]};
    },
    async connect() {
      return {
        async query(sql, args) {
          queries.push({sql, args});
          return {rowCount: 1, rows: []};
        },
        release() {}
      };
    }
  };
  const pgDb = adaptPostgres(fakePool);
  const first = await pgDb.prepare('SELECT code FROM rooms WHERE code=?').bind('ABCDEF1234').first();
  assert.equal(first.code, 'ABCDEF1234');
  assert.equal(queries[0].sql, 'SELECT code FROM rooms WHERE code=$1');
  assert.deepEqual(queries[0].args, ['ABCDEF1234']);
  const batchRes = await pgDb.batch([
    pgDb.prepare('INSERT OR IGNORE INTO plots(room,slot) VALUES (?,?)').bind('ABCDEF1234', 0)
  ]);
  assert.equal(batchRes[0].meta.changes, 1);
  assert.ok(queries.some(q => q.sql === 'BEGIN'));
  assert.ok(queries.some(q => q.sql === 'COMMIT'));
});
