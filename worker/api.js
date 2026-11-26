import {cleanProgress,learnerForJoin} from './progress.js';
const TTL=35000,CAPACITY=36;
const colors=['#de8d48','#67937c','#7564a7','#c45f68','#488bb0'];
const crops={carrot:120000,tomato:180000,corn:300000};
function reply(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
async function hash(token){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
function plotPosition(slot){return {x:-21+(slot%4)*4,z:-15+Math.floor(slot/4)*4}}
export async function api(request,env){
const url=new URL(request.url);if(request.method!=='POST')return reply({error:'Gunakan POST.'},405);
if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return reply({error:'Asal permintaan tidak valid.'},403);
const maxBody=url.pathname==='/api/rooms/progress'?65536:4096;
if(Number(request.headers.get('content-length')||0)>maxBody)return reply({error:'Data terlalu besar.'},413);
let b;try{let text=await request.text();if(text.length>maxBody)return reply({error:'Data terlalu besar.'},413);b=JSON.parse(text);if(!b||typeof b!=='object'||Array.isArray(b))throw Error()}catch{return reply({error:'Data tidak valid.'},400)}
const now=Date.now(),cutoff=now-TTL;let room=typeof b.room==='string'?b.room.trim().toUpperCase():'';
if(url.pathname==='/api/rooms/create'){const code=crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();await env.DB.prepare('INSERT INTO rooms(code,created_at) VALUES (?,?)').bind(code,now).run();return reply({room:code,capacity:CAPACITY},201)}
if(!/^[A-F0-9]{10}$/.test(room))return reply({error:'Kode kelas harus 10 karakter, sesuai kode dari guru.'},400);
if(url.pathname==='/api/rooms/join'){
const name=typeof b.name==='string'?b.name.trim():'';if(name.length<2||name.length>25)return reply({error:'Nama panggilan harus 2–25 karakter.'},400);
const exists=await env.DB.prepare('SELECT code FROM rooms WHERE code=?').bind(room).first();if(!exists)return reply({error:'Kelas tidak ditemukan. Periksa kode dari guru.'},404);
const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID(),tokenHash=await hash(token),color=colors.includes(b.color)?b.color:colors[0];
const r=await env.DB.prepare('INSERT INTO players(id,token_hash,room,name,color,x,y,seen) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM players WHERE room=? AND seen>?)<?').bind(id,tokenHash,room,name,color,6+Math.random()*.3,8+Math.random()*.3,now,room,cutoff,CAPACITY).run();if(!r.meta.changes)return reply({error:'Kelas penuh: 36 pemain sedang online.'},409);const learner=await learnerForJoin(env.DB,b.learnerToken,hash);await env.DB.prepare('UPDATE players SET learner_id=? WHERE id=?').bind(learner.id,id).run();await env.DB.prepare('INSERT INTO enrollments(room,learner_id,display_name,joined_at,last_seen) VALUES (?,?,?,?,?) ON CONFLICT(room,learner_id) DO UPDATE SET display_name=excluded.display_name,last_seen=excluded.last_seen').bind(room,learner.id,name,now,now).run();const prior=await env.DB.prepare('SELECT progress,saved_at,revision FROM enrollments WHERE room=? AND learner_id=?').bind(room,learner.id).first();return reply({id,token,room,capacity:CAPACITY,learnerId:learner.id,learnerToken:learner.token,priorProgress:prior?.saved_at?JSON.parse(prior.progress):null,revision:prior?.revision||0},201)}
if(!['/api/rooms/sync','/api/rooms/leave','/api/rooms/action','/api/rooms/progress'].includes(url.pathname))return reply({error:'Tidak ditemukan.'},404);
const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');if(token.length<50||token.length>100)return reply({error:'Sesi tidak valid. Masuk kelas kembali.'},401);const tokenHash=await hash(token);
if(url.pathname.endsWith('/progress')){const me=await env.DB.prepare('SELECT id,learner_id,name FROM players WHERE token_hash=? AND room=? AND seen>?').bind(tokenHash,room,cutoff).first();if(!me||!me.learner_id)return reply({error:'Masuk kelas kembali untuk mengaktifkan penyimpanan.'},401);const progress=cleanProgress(b.progress);if(!progress)return reply({error:'Progres tidak valid.'},400);if(!Number.isInteger(b.revision)||b.revision<0)return reply({error:'Versi progres tidak valid.'},400);const updated=await env.DB.prepare('UPDATE enrollments SET progress=?,display_name=?,saved_at=?,last_seen=?,revision=revision+1 WHERE room=? AND learner_id=? AND revision=?').bind(JSON.stringify(progress),me.name,now,now,room,me.learner_id,b.revision).run();if(!updated.meta.changes)return reply({error:'Progres berubah di sesi lain. Muat ulang kelas sebelum melanjutkan.'},409);return reply({ok:true,savedAt:now,revision:b.revision+1})}
if(url.pathname.endsWith('/leave')){await env.DB.prepare('DELETE FROM players WHERE token_hash=? AND room=?').bind(tokenHash,room).run();return reply({ok:true})}
if(url.pathname.endsWith('/action')){
const me=await env.DB.prepare('SELECT * FROM players WHERE token_hash=? AND room=? AND seen>?').bind(tokenHash,room,cutoff).first();if(!me)return reply({error:'Masuk kelas terlebih dahulu.'},401);let px=(me.x-6)*6,pz=(me.y-6)*6;
if(b.action==='build'){
let x=Number(b.x),z=Number(b.z);if(!Number.isInteger(x)||!Number.isInteger(z)||x<16||x>30||z< -25||z> -11||x%2||z%2)return reply({error:'Bangun pada petak kreatif yang ditandai.'},400);if(Math.hypot(px-x,pz-z)>7)return reply({error:'Dekati lokasi bangunan terlebih dahulu.'},400);
const color=colors.includes(b.color)?b.color:colors[0];const r=await env.DB.prepare('INSERT OR IGNORE INTO builds(id,room,player_id,color,x,z,created_at) SELECT ?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM builds WHERE room=?)<64').bind(crypto.randomUUID(),room,me.id,color,x,z,now,room).run();if(!r.meta.changes)return reply({error:'Petak terisi atau batas 64 blok tercapai.'},409);return reply({ok:true,message:'Blok dibangun bersama kelas.'})}
if(b.action==='remove'){
let row=await env.DB.prepare('SELECT * FROM builds WHERE id=? AND room=? AND player_id=?').bind(String(b.id),room,me.id).first();if(!row)return reply({error:'Kamu hanya bisa mengambil blok milikmu.'},403);if(Math.hypot(px-row.x,pz-row.z)>7)return reply({error:'Dekati blok terlebih dahulu.'},400);await env.DB.prepare('DELETE FROM builds WHERE id=? AND player_id=?').bind(row.id,me.id).run();return reply({ok:true,message:'Blok diambil kembali.'})}
let slot=Number(b.slot);if(!Number.isInteger(slot)||slot<0||slot>11)return reply({error:'Petak tidak valid.'},400);const pos=plotPosition(slot);if(Math.hypot(px-pos.x,pz-pos.z)>6)return reply({error:'Dekati petak kebun terlebih dahulu.'},400);
await env.DB.prepare('INSERT OR IGNORE INTO plots(room,slot) VALUES (?,?)').bind(room,slot).run();const plot=await env.DB.prepare('SELECT * FROM plots WHERE room=? AND slot=?').bind(room,slot).first();let r;
if(b.action==='plant'){
if(!Object.hasOwn(crops,b.crop))return reply({error:'Benih tidak tersedia.'},400);r=await env.DB.prepare("UPDATE plots SET crop=?,planted_at=?,watered=0,fed=0,version=version+1,owner_name=? WHERE room=? AND slot=? AND crop='' AND version=?").bind(b.crop,now,me.name,room,slot,plot.version).run();
}else if(b.action==='water'||b.action==='feed'){
const column=b.action==='water'?'watered':'fed';r=await env.DB.prepare(`UPDATE plots SET ${column}=1,version=version+1 WHERE room=? AND slot=? AND crop<>'' AND ${column}=0 AND version=?`).bind(room,slot,plot.version).run();
}else if(b.action==='harvest'){
if(!plot.crop||!plot.watered||!plot.fed||now-plot.planted_at<crops[plot.crop])return reply({error:'Tanaman perlu disiram, diberi kompos, dan cukup umur sebelum dipanen.'},409);
const receipt=crypto.randomUUID();const results=await env.DB.batch([
env.DB.prepare('INSERT INTO harvest_receipts(id,room,player_id,slot,created_at) SELECT ?,?,?,?,? FROM plots WHERE room=? AND slot=? AND version=? AND crop<>\'\' AND watered=1 AND fed=1').bind(receipt,room,me.id,slot,now,room,slot,plot.version),
env.DB.prepare("UPDATE plots SET crop='',planted_at=0,watered=0,fed=0,owner_name='',version=version+1 WHERE room=? AND slot=? AND EXISTS(SELECT 1 FROM harvest_receipts WHERE id=?)").bind(room,slot,receipt),
env.DB.prepare('UPDATE players SET farm_xp=farm_xp+40,farm_coins=farm_coins+25,harvests=harvests+1 WHERE id=? AND EXISTS(SELECT 1 FROM harvest_receipts WHERE id=?)').bind(me.id,receipt),
env.DB.prepare('UPDATE enrollments SET harvests=harvests+1 WHERE room=? AND learner_id=? AND EXISTS(SELECT 1 FROM harvest_receipts WHERE id=?)').bind(room,me.learner_id,receipt)
]);r=results[0];
}else return reply({error:'Aktivitas tidak tersedia.'},400);
if(!r.meta.changes)return reply({error:'Petak baru saja berubah atau aktivitas ini sudah dilakukan. Coba perbarui.'},409);return reply({ok:true,message:({plant:'Benih ditanam! Siram dan beri kompos.',water:'Tanaman sudah disiram.',feed:'Kompos matang ditambahkan.',harvest:'Panen berhasil! +40 XP dan +25 koin.'})[b.action]})}
let x=Number(b.x),y=Number(b.y);if(!Number.isFinite(x)||!Number.isFinite(y))return reply({error:'Posisi tidak valid.'},400);x=Math.max(.6,Math.min(12,x));y=Math.max(.6,Math.min(12,y));const color=colors.includes(b.color)?b.color:colors[0],elevation=Number.isFinite(b.elevation)?Math.max(0,Math.min(15,b.elevation)):0,yaw=Number.isFinite(b.yaw)?b.yaw%(Math.PI*2):0;
const r=await env.DB.prepare('UPDATE players SET x=?,y=?,color=?,seen=?,elevation=?,yaw=?,moving=?,emote_at=CASE WHEN ?=1 AND emote_at<? THEN ? ELSE emote_at END WHERE token_hash=? AND room=? AND (seen>? OR (SELECT COUNT(*) FROM players WHERE room=? AND seen>?)<?)').bind(x,y,color,now,elevation,yaw,b.moving?1:0,b.wave===true?1:0,now-3000,now,tokenHash,room,cutoff,room,cutoff,CAPACITY).run();if(!r.meta.changes)return reply({error:'Sesi berakhir atau kelas penuh. Silakan masuk kembali.'},410);
const [people,plots,builds]=await Promise.all([env.DB.prepare('SELECT id,name,color,x,y,elevation,yaw,moving,emote_at,farm_xp,farm_coins,harvests FROM players WHERE room=? AND seen>? ORDER BY id LIMIT 36').bind(room,cutoff).all(),env.DB.prepare('SELECT slot,crop,planted_at,watered,fed,version,owner_name FROM plots WHERE room=?').bind(room).all(),env.DB.prepare('SELECT id,player_id,color,x,z FROM builds WHERE room=? ORDER BY created_at LIMIT 64').bind(room).all()]);return reply({players:people.results,plots:plots.results,builds:builds.results,capacity:CAPACITY,serverTime:now});
}
