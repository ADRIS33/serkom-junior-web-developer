# Serkom Junior Web Developer — Portfolio + Kriya Kita

Project ini disusun untuk memenuhi latihan uji kompetensi Skema Junior Web Developer.

## Isi project
- `portfolio/` — website statis profil pribadi.
- `store/` — website dinamis usaha kerajinan tangan "Kriya Kita".
- `backend/` — REST API Express + MySQL + JWT.
- `database/kriya_kita.sql` — schema + seed data lengkap.

## Kompetensi yang ditunjukkan
1. Implementasi User Interface.
2. Pemrograman berbasis teks, grafik, dan multimedia (SVG/icon/galeri produk).
3. Organisasi file dan resource yang rapi.
4. Penulisan kode dengan guideline/best practices dasar.
5. Pemrograman terstruktur dan modular.
6. Penggunaan komponen/library pre-existing: React, React Router, Express, MySQL2, bcryptjs, JWT.

## Teknologi
- React + Vite
- React Router
- Express.js
- MySQL
- JWT + bcryptjs
- CSS responsif

## Menjalankan
### 1. Database
Buat database MySQL dan import `database/kriya_kita.sql`.

### 2. Backend
```bash
cd backend
npm install
copy .env.example .env
npm start
```
Linux/macOS:
```bash
cp .env.example .env
```
Default API: `http://localhost:5000`

### 3. Store
```bash
cd store
npm install
npm run dev
```
Default Vite: `http://localhost:5173`

### 4. Portfolio
```bash
cd portfolio
npm install
npm run dev -- --port 5174
```
Default: `http://localhost:5174`

Portfolio mengarah ke store pada `http://localhost:5173`.
Jika port berbeda, ubah `VITE_STORE_URL` pada `portfolio/.env`.

## Akun demo
- Admin: `admin.admin`
- Password: `admin123`

Untuk keamanan, password hanya digunakan untuk demo lokal. Jangan memakai kredensial ini di production.

## Alur demo asesor
1. Buka portfolio → lihat profil, skill, project → klik **Lihat Kriya Kita**.
2. Buka store → lihat katalog, search, filter kategori.
3. Buka detail produk → tambah ke keranjang.
4. Login/register → checkout → lihat pesanan.
5. Login sebagai admin → Dashboard → kelola produk → kelola pesanan.
