# Memasang AgroQuest di akun Vercel

## Mode bawaan: frontend Vercel + backend AgroQuest saat ini

Mode ini langsung memakai database dan ruang kelas yang sudah online. Tidak perlu menyalin data siswa atau menyediakan database baru untuk langkah awal.

1. Ekstrak ZIP dan buka folder di Antigravity IDE.
2. Di terminal jalankan `npm ci`, `npm test`, dan `npm run build`.
3. Gunakan GitHub untuk mengunggah folder proyek, lalu Import Project di Vercel; atau jalankan CLI resmi:

```powershell
npx vercel
```

4. Ikuti login resmi Vercel pada browser dan pilih akun/team milik Anda. Buat proyek baru agar tidak menimpa aplikasi lain.
5. Framework pilih **Other**, Build Command `npm run build`, Output Directory `public`, Node.js **24.x**. Konfigurasi dasarnya sudah tersedia di `vercel.json`.
6. Untuk deployment produksi setelah preview berhasil:

```powershell
npx vercel --prod
```

Di Vercel, kode otomatis memakai mode `proxy` saat variabel sistem `VERCEL` aktif. API kelas diteruskan ke backend di bawah ini:

`https://agroquest-bansari-9nov.aceticscone8.chatgpt.site`

Variabel opsional pada Vercel:

```text
AGRO_BACKEND_MODE=proxy
REMOTE_API_BASE=https://agroquest-bansari-9nov.aceticscone8.chatgpt.site
```

`/guru` mengarahkan ke ruang guru di backend lama. Login guru pada mode ini memakai akun ChatGPT pemilik game. Login email/password yang dibuat `npm run setup` hanya untuk database lokal atau mode standalone.

Mode ini bukan migrasi seluruh server ke Vercel: backend lama harus tetap aktif. Jangan memakai nama proyek Vercel yang sudah berisi aplikasi lain tanpa memeriksanya terlebih dahulu.

## Opsi lanjutan A: Vercel standalone + Supabase Postgres (`poemcdwwtmoaovhhfhyt`)

Pilih ini untuk menggunakan database **Supabase Postgres** tanpa bergantung pada backend lama:

1. Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/poemcdwwtmoaovhhfhyt/sql/new) dan jalankan seluruh isi file `supabase/migrations/20261109000000_agroquest_supabase_postgres.sql` (atau jalankan `npm run db:migrate` setelah `SUPABASE_DB_URL` diisi).
2. Salin URI **Transaction Pooler (port 6543)** dari [Supabase Connect Settings](https://supabase.com/dashboard/project/poemcdwwtmoaovhhfhyt?showConnect=true) (ganti `[YOUR-PASSWORD]` dengan password database Anda secara pribadi).
3. Jalankan `npm run setup` di terminal lokal untuk membuat hash akun guru dan rahasia sesi di `.env`.
4. Isi variabel berikut di `.env` lokal dan di **Vercel Environment Variables** (jangan masukkan password ke chat atau kode sumber):

```text
AGRO_BACKEND_MODE=standalone
TEACHER_EMAIL=email_guru_anda
TEACHER_PASSWORD_HASH=hash_yang_dibuat_setup
TEACHER_SESSION_SECRET=rahasia_yang_dibuat_setup
SUPABASE_DB_URL=postgresql://postgres.poemcdwwtmoaovhhfhyt:[PASSWORD_DB_ANDA]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

5. Deploy ulang (`npx vercel --prod`), lalu buka `/guru` untuk masuk dengan email dan password guru Anda serta membuat kelas baru.

## Opsi lanjutan B: Vercel standalone + Turso

Pilih ini jika ingin backend lama tidak digunakan. Buat database Turso sendiri, periksa ketentuan dan biaya layanan, lalu sediakan URL dan token database melalui konfigurasi pribadi, bukan percakapan atau kode sumber.

1. Jalankan `npm run setup` untuk membuat akun guru dan rahasia sesi di `.env` lokal.
2. Atur `.env` secara pribadi:

```text
AGRO_BACKEND_MODE=standalone
TEACHER_EMAIL=email_guru_anda
TEACHER_PASSWORD_HASH=hash_yang_dibuat_setup
TEACHER_SESSION_SECRET=rahasia_yang_dibuat_setup
TURSO_DATABASE_URL=libsql://database-anda.turso.io
TURSO_AUTH_TOKEN=token_pribadi_anda
```

3. Jalankan `npm run db:migrate` dari komputer untuk menerapkan skema ke database Turso yang telah dipilih. Jangan arahkan ke database yang tidak terkait proyek ini.
4. Tambahkan enam nilai tadi pada Environment Variables proyek Vercel. Tandai rahasia sebagai sensitive bila tersedia. Jangan memakai prefiks `NEXT_PUBLIC_` untuk password, hash, rahasia sesi, atau token database.
5. Deploy ulang. Mode standalone memakai login guru email/password dan database Turso; tidak menggunakan login ChatGPT di backend lama.
6. Buka `/guru`, buat kelas baru, lalu uji dua perangkat. Database standalone baru tidak otomatis mengimpor data siswa dari backend lama.

File SQLite lokal di serverless bukan penyimpanan bersama yang menetap. Mode standalone Vercel sengaja menolak `file:` atau database lokal agar data tidak dianggap sudah aman padahal hanya tersimpan sementara.

## Pengujian setelah deployment

- Buka game dari tautan HTTPS Vercel.
- Ketuk layar; periksa musik, bisu, dan volume.
- Dua siswa masuk dengan kode yang sama dan melihat avatar teman.
- Selesaikan latihan atau refleksi; tunggu indikator “Tersimpan untuk guru”.
- Buka `/guru` dengan akun guru, periksa data siswa, lalu unduh CSV.
- Keluar dan masuk kembali untuk memastikan progres bertahan.
- Setelah itu uji bersama kelas 36 siswa. Pengujian otomatis bukan pengganti uji beban 36 HP nyata.
