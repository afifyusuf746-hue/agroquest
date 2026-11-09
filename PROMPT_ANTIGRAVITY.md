Saya ingin melanjutkan proyek AgroQuest Worlds ATPH yang sudah ada di folder ini.
Baca README.md dan PANDUAN_VERCEL.md dahulu. Jangan membuat proyek baru atau mengganti game dengan template.

Tujuan:
1. Jalankan game, materi, musik, kelas 36 pemain, penyimpanan progres, dan ruang guru.
2. Siapkan deployment pada akun Vercel saya dengan proyek baru bernama agroquest-atph bila nama itu tersedia, tanpa menimpa proyek lain.
3. Pertahankan seluruh materi ATPH, dunia 3D, kamera, avatar, aktivitas kebun, dan laporan siswa.

Pengerjaan:
- Periksa Node.js 24.x, pasang dependency dari lockfile dengan npm ci.
- Jalankan npm test dan npm run build. Perbaiki kegagalan yang benar-benar ditemukan.
- Untuk lokal, jalankan npm run setup di terminal interaktif. Saya akan mengisi email/password guru sendiri. Jangan menulis password contoh tetap atau menampilkan isi .env.
- Jalankan npm start, lalu uji http://localhost:3000 dan /guru.
- Untuk Vercel gunakan mode proxy bawaan terlebih dahulu: frontend Vercel, API ke backend AgroQuest yang sudah berjalan, dan ruang guru diarahkan ke backend lama. Tidak perlu membuat layanan database baru pada tahap ini.
- Pastikan vercel.json dipakai, Framework Other, Build Command npm run build, Output Directory public, dan Node.js 24.x.
- Login Vercel melalui alur resmi akun saya. Jangan meminta token/password di percakapan.
- Gunakan preview terlebih dahulu, verifikasi dua perangkat dapat bertemu, kemudian deploy produksi sesuai instruksi saya. Jangan membeli paket, mengaktifkan langganan berbayar, atau mengubah proyek Vercel lain.
- Jika saya memilih standalone nanti, gunakan adaptor Turso yang disediakan dan lakukan migrasi hanya pada database proyek yang telah saya tentukan. Jangan gunakan file SQLite lokal untuk penyimpanan produksi Vercel.

Validasi:
- Login guru lokal menolak password salah dan header identitas palsu.
- Batas kelas 36 pemain; pemain ke-37 ditolak ketika penuh.
- Simpan skor/refleksi, keluar, lalu masuk kembali dan verifikasi progres.
- Guru dapat melihat kelas serta mengunduh CSV, siswa tidak dapat membaca API laporan guru.
- Musik mulai setelah interaksi, bisa dibisukan, dan berhenti saat tab disembunyikan.

Laporkan URL preview/produksi yang benar-benar berhasil, hasil uji, mode backend yang dipakai, dan konfigurasi yang masih belum tersedia. Jangan menyatakan deployment atau migrasi data selesai jika belum terverifikasi.
