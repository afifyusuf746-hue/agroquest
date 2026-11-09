# AgroQuest Worlds — paket Antigravity IDE

Game edukasi ATPH 3D: dunia blok, kamera bebas, avatar berjalan/lompat, kelas 36 pemain, kebun bersama, membangun, 12 materi, 36 soal, refleksi, musik, dan laporan guru.

## Mulai di Windows

1. Pasang **Node.js 24.x** dari https://nodejs.org/ bila belum ada.
2. Ekstrak ZIP, misalnya ke `F:\AgroQuest_Antigravity`.
3. Di Antigravity IDE pilih **Open Folder**, lalu pilih folder tersebut.
4. Klik dua kali `MULAI_WINDOWS.bat`, atau jalankan di terminal:

```powershell
npm ci
npm run setup
npm start
```

5. Setup meminta email dan password guru. Password minimal 12 karakter dan tidak ditampilkan saat diketik. Tidak ada password bawaan.
6. Buka `http://localhost:3000` untuk game dan `http://localhost:3000/guru` untuk guru.
7. Masuk ke ruang guru, buat kelas, lalu bagikan kode kepada siswa. Mode lokal memiliki database baru; kelas atau data lama tidak disertakan dalam ZIP.

Jangan membuka HTML dengan klik ganda atau alamat `file://`. Game membutuhkan server untuk database, kelas, dan login guru. Internet diperlukan saat pertama memasang paket. Musik mulai setelah interaksi pertama di layar.

## Dua mode penyimpanan

| Mode | Game dibuka di | Database dan guru |
| --- | --- | --- |
| Lokal, bawaan `npm start` | localhost | SQLite `data/agroquest.db`, akun guru dibuat oleh setup |
| Vercel, bawaan saat deployment | domain Vercel | API diteruskan ke backend AgroQuest yang sudah online; `/guru` menuju ruang guru online dan memakai login ChatGPT pemilik |

Mode Vercel bawaan **tetap bergantung pada backend lama**. Ini mempertahankan akses ke kelas dan laporan online yang sudah ada tanpa meletakkan file SQLite di fungsi Vercel. Kode kelas online tetap menggunakan backend lama. Data pengembangan lokal terpisah dan tidak otomatis tersinkron ke situs online.

Identitas siswa terkait browser dan domain yang dipakai. Memindahkan siswa ke domain baru dapat membuat identitas perangkat baru. Laporan lama di backend tetap ada; progres lokal browser tidak otomatis berpindah domain.

Untuk melepas ketergantungan backend lama, lihat opsi **Vercel standalone + Turso** di `PANDUAN_VERCEL.md`.

## Di Antigravity

Buka `PROMPT_ANTIGRAVITY.md` dan salin isinya ke agen IDE setelah folder proyek dibuka. Kode sudah ada; tidak perlu membuat game ulang. Jalankan `npm test` setelah perubahan dan `npm run build` untuk memperbarui `public/`.

## File penting

- `src/`: game 3D, tampilan, audio, materi, dan ruang guru.
- `worker/`: logika kelas, aktivitas, progres, dan laporan.
- `server/`: server lokal, adaptor database, login guru, dan proxy Vercel.
- `api/handler.js`: pintu masuk Vercel Functions.
- `drizzle/`: migrasi skema SQL.
- `scripts/setup.mjs`: pembuatan konfigurasi dan akun guru lokal.
- `public/`: hasil build siap disajikan; dibangun ulang dari `src/`.
- `vercel.json`: konfigurasi deployment Vercel.

## Backup lokal

Hentikan server sebelum menyalin folder `data/`. Simpan backup folder `data/` dan `.env` di tempat pribadi. File `.env` berisi konfigurasi rahasia dan tidak masuk ZIP atau Git. Jangan mengunggah database siswa ke repositori publik. Password guru disimpan sebagai hash, sesi memakai cookie HttpOnly, dan header identitas dari klien tidak dipercaya.

## Batas paket

- Paket ini berisi kode dan skema, **bukan ekspor data siswa dari situs lama**.
- Tidak memuat akun Vercel, token database, atau password guru yang sudah diisi.
- Multiplayer memakai pembaruan posisi berkala; pengujian 36 perangkat fisik tetap perlu dilakukan.
- Nilai latihan berasal dari progres perangkat; asesmen akhir tetap dilakukan guru.
- Tidak ada pembelian layanan atau langganan yang dijalankan oleh paket ini.

## Referensi teknis

- Vercel Node.js Functions: https://vercel.com/docs/functions/runtimes/node-js
- Penyimpanan SQLite dan serverless: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel
- libSQL client: https://github.com/tursodatabase/libsql-client-ts
