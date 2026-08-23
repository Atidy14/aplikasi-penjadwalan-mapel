# 📅 SIP-MAPEL v2.0 Pro — Sistem Penjadwalan Mata Pelajaran Sekolah

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

Platform terpadu penyusunan jadwal belajar mengajar sekolah otomatis berbasis **Algoritma Greedy Heuristic**, dilengkapi validasi anti-bentrok instan, manajemen ketersediaan/izin guru, modul serah terima (*soft-turnover*), papan penjadwal interaktif, dan fasilitas cetak PDF resmi.

---

## 🚀 Uji Coba Cepat (1-Click Run di Browser via GitHub Codespaces)

Rekan Anda dapat langsung menjalankan dan menguji aplikasi ini secara online tanpa perlu menginstal apa pun di komputer mereka:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Atidy14/aplikasi-penjadwalan-mapel)

> **Langkah Pengujian di Codespaces:**
> 1. Klik tombol **Open in GitHub Codespaces** di atas.
> 2. Terminal Codespaces akan otomatis terbuka.
> 3. Jalankan: `npm run dev`
> 4. Klik tombol pop-up **"Open in Browser"** (Port 3000) untuk mulai mencoba!

---

## 🌟 Fitur Utama

- ⚡ **Auto-Generator Cerdas & Undo Rollback**: Menyusun ratusan slot jadwal otomatis dalam 1-2 detik bebas bentrok guru dan kelas. Dilengkapi tombol *Undo* untuk memulihkan jadwal jika tidak sengaja tertekan.
- 👨‍🏫 **Ketersediaan & Izin Guru (Teacher Constraints)**: Kalender interaktif untuk memblokir hari/jam guru berhalangan mengajar (kuliah, tugas luar, atau libur).
- 📋 **Kertas Kerja (Teaching Load)**: Matriks penugasan guru, mapel, kelas, dan beban jam/minggu dengan proteksi *upsert*.
- 📅 **Papan Penjadwalan Grid Interaktif**: Tampilan jadwal Senin-Sabtu (jam 1-8), baris istirahat visual, dan *progress bar* pemenuhan jam mengajar.
- 🔄 **Serah Terima Guru (Turnover Handover)**: Mutasi jadwal antar-guru di tengah semester secara historis tanpa menghapus arsip lama (`validFrom` / `validUntil`).
- 🖨️ **Cetak & Export PDF Resmi**: Rekapitulasi cetak jadwal per rombel kelas (X, XI, XII) dan jadwal mengajar personal guru dengan kop surat dan kolom pengesahan Kepala Sekolah.
- 📜 **Audit Log Trail**: Pencatatan lengkap seluruh mutasi jadwal dan riwayat auto-generator.
- 📘 **Dokumentasi Lengkap**: Tersedia file [MANUAL_BOOK_SIP_MAPEL_v2.0_PRO.docx](./MANUAL_BOOK_SIP_MAPEL_v2.0_PRO.docx) di dalam repository.

---

## 🛠️ Menjalankan Secara Lokal (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/Atidy14/aplikasi-penjadwalan-mapel.git
cd aplikasi-penjadwalan-mapel
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Setup Database (SQLite Siap Pakai)
```bash
npx prisma generate
npx prisma db push
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka **`http://localhost:3000`** di browser Anda.

---

## 🗂️ Struktur Folder Proyek
```text
├── app/
│   ├── actions/          # Next.js Server Actions (Backend Logic)
│   ├── components/       # UI Components (SchedulerGrid, GeneratorButton, Modal, dll)
│   ├── lib/              # Prisma Client & Auto-Generator Service
│   ├── master/           # Modul Guru, Mapel, Kelas, Kertas Kerja, Auto-Gen, Cetak & Audit
│   └── page.tsx          # Beranda Utama (Portal Grid Menu)
├── prisma/
│   └── schema.prisma     # Relational Database Schema
├── screenshots/          # 10 Tangkapan Layar Resmi
└── MANUAL_BOOK_SIP_MAPEL_v2.0_PRO.docx # Buku Panduan Pengguna Resmi
```

---

## 📄 Lisensi
Dikembangkan untuk instansi pendidikan dan manajemen sekolah. Bebas dimodifikasi di bawah lisensi MIT.
