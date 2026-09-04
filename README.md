# LearnOut 🎓 — Platform Belajar Interaktif & Tryout UTBK/SNBT

> Platform edukasi interaktif berbasis web yang menggabungkan filosofi gamifikasi Duolingo (XP, Level, Daily Streaks, Leaderboard, Badges, Bite-sized Lessons) dengan sistem simulasi ujian UTBK/SNBT standar nasional (Timer mundur ujian, Palet nomor, Tandai Ragu-ragu, Penilaian Berskala IRT 200–850, dan Pembahasan Mendalam).

---

## 🌟 Fitur Utama

- **Gamifikasi Pembelajaran (Duolingo-inspired)**:
  - ⚡ **XP & Leveling System**: Formula progres adaptif $\text{Level} = \lfloor\sqrt{\text{XP} / 50}\rfloor + 1$.
  - 🔥 **Daily Streak Tracker**: Melacak konsistensi belajar harian tanpa putus.
  - 🏆 **Leaderboard Mingguan & Sepanjang Masa**: Podium Top 3 (Emas, Perak, Perunggu) dan peringkat komunitas.
  - 🎖️ **Badge & Achievements**: Penghargaan otomatis saat mencapai milestone belajar.
  - 📖 **Bite-sized Lessons**: Materi ringkas, tips interaktif, dan reward per modul.

- **Mesin Kuis Interaktif**:
  - Tampilan 1 soal per halaman dengan bilah progres real-time.
  - Palet navigasi nomor soal yang responsif.
  - *Anti-cheat*: Kunci jawaban disanitasi di sisi backend selama pengerjaan.
  - Pembahasan kunci jawaban mendalam setelah pengiriman.

- **Simulasi Ujian UTBK / SNBT**:
  - Fullscreen exam mode dengan countdown timer otomatis.
  - Tombol **Tandai Ragu-ragu** (palet warna kuning).
  - Skoring terstandardisasi berskala IRT (skor 200 s.d. 850) per subtes (Penalaran Umum, Kuantitatif, Literasi).
  - Riwayat pengerjaan dan telaah soal yang salah.

- **Admin Management Panel**:
  - Metrik analitik platform (total siswa, kursus aktif, estimasi omset).
  - Manajemen katalog kursus (CRUD).
  - Manajemen hak akses pengguna (`USER` <-> `ADMIN`).

- **Monetisasi LearnOut PRO**:
  - Paket langganan Bulanan & Tahunan dengan benefit streak freeze, materi eksklusif, dan simulasi tryout tanpa batas.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **State & Data Fetching**: TanStack React Query + Axios
- **Routing**: React Router DOM v6

### Backend
- **Framework**: NestJS 10 + TypeScript
- **ORM & Database**: Prisma ORM + PostgreSQL
- **Security & Auth**: JWT (Access & Refresh Token), Bcrypt, Helmet, CORS, Class Validator
- **API Documentation**: Swagger / OpenAPI (`/api/docs`)

---

## 🚀 Panduan Menjalankan Project

### 1. Prasyarat
- Node.js v18+ & npm
- PostgreSQL (aktif di port 5432)

### 2. Konfigurasi Backend
```bash
cd backend
cp .env.example .env
# Sesuaikan DATABASE_URL dan JWT_SECRET di backend/.env
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```
Backend akan berjalan di `http://localhost:3000` (Swagger docs di `http://localhost:3000/api/docs`).

### 3. Konfigurasi Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`.

---

## 👤 Akun Demo Bawaan (Seed Database)

| Peran | Email | Kata Sandi | Deskripsi |
|---|---|---|---|
| **Siswa (Regular User)** | `budi@learnout.id` | `user123` | Akses belajar, kuis, leaderboard, UTBK tryout, dan dasbor progres. |
| **Administrator** | `admin@learnout.id` | `admin123` | Akses panel admin di `/admin`, kelola kursus, dan kelola role user. |

---

## 📄 Lisensi
Distributed under the MIT License.
