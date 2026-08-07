# GEMASIX Landing Page

Website resmi Karang Taruna **GEMASIX (Genuk Baru RT 06 RW 07)** yang berfungsi sebagai media informasi organisasi, publikasi program kerja, dokumentasi kegiatan, dokumentasi pertemuan, agenda organisasi, transparansi pengeluaran, serta menyediakan fitur **NGL (Anonymous Message)**.

Website ini menggunakan konsep **CMS sederhana**, di mana seluruh konten pada Landing Page dikelola melalui halaman **Admin Dashboard**.

---

# Tech Stack

## Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React

## Backend

- Next.js Server Actions
- Route Handlers (API Routes)

## Database

- PostgreSQL
- Prisma ORM

## Storage

- Cloudinary

## Deployment

- Vercel

---

# Features

## Landing Page

- Hero Section
- Tentang Kami
- Struktur Organisasi & Anggota
- Program Kerja
- Dokumentasi Kegiatan
- Agenda / Event
- FAQ
- Call To Action
- Footer

---

## NGL (Anonymous Message)

Pengunjung dapat mengirim pesan secara anonim kepada pengurus.

Fitur:

- Kirim pesan anonim
- Validasi input
- Anti spam
- Dashboard Admin
- Hapus pesan
- Generate Story Instagram

---

## Dashboard Admin

Seluruh konten website dikelola melalui Dashboard Admin.

Fitur:

- Dashboard
- CRUD Anggota
- CRUD Program Kerja
- Upload Dokumentasi Kegiatan
- CRUD Agenda / Event
- CRUD Dokumentasi Pertemuan
- CRUD Catatan Pengeluaran
- CRUD FAQ
- Kelola Pesan NGL

---

# Folder Structure

```text
gemasix/

├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── gallery/
│   │   ├── members/
│   │   ├── programs/
│   │   └── logo/
│   │
│   ├── icons/
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│
│   ├── app/
│   │
│   │   ├── (landing)/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── ngl/
│   │   │   ├── page.tsx
│   │   │   └── success/
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── members/
│   │   │   ├── programs/
│   │   │   ├── events/
│   │   │   ├── meetings/
│   │   │   ├── finance/
│   │   │   ├── faq/
│   │   │   └── messages/
│   │   │
│   │   ├── api/
│   │   │   └── upload/
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── manifest.ts
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Container.tsx
│   │   │   └── Section.tsx
│   │   │
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Organization.tsx
│   │   │   ├── Programs.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── NGLBanner.tsx
│   │   │
│   │   ├── cards/
│   │   │
│   │   ├── ngl/
│   │   │
│   │   └── ui/
│   │
│   ├── features/
│   │
│   │   ├── members/
│   │   ├── programs/
│   │   ├── events/
│   │   ├── meetings/
│   │   ├── finance/
│   │   ├── faq/
│   │   └── messages/
│   │
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── constants/
│   ├── data/
│   └── middleware.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

# Landing Page Structure

```text
Navbar

Hero

Tentang Kami

Struktur Organisasi & Anggota

Program Kerja

Agenda / Event

NGL

FAQ

Call To Action

Footer
```

> Dokumentasi kegiatan ditampilkan sebagai bagian dari setiap Program Kerja.

---

# Dashboard Structure

```text
Dashboard

├── Dashboard
├── Anggota
├── Program Kerja
├── Agenda
├── Dokumentasi Pertemuan
├── Catatan Pengeluaran
├── FAQ
└── Pesan NGL
```

---

# Database Models

## Member

Data anggota Karang Taruna.

- Nama
- Jabatan
- Foto
- Bio

---

## Program

Program kerja organisasi.

- Judul
- Deskripsi
- Thumbnail
- Tanggal
- Penanggung Jawab

### Dokumentasi

Setiap Program memiliki banyak dokumentasi kegiatan.

- Foto
- Caption

---

## Event

Agenda kegiatan.

- Judul
- Lokasi
- Tanggal
- Waktu
- Deskripsi

---

## Meeting

Dokumentasi hasil rapat organisasi.

- Judul
- Tanggal
- Lokasi
- Notulen
- Daftar Peserta
- Lampiran

---

## Finance

Catatan keuangan organisasi.

- Tipe (Pemasukan / Pengeluaran)
- Nominal
- Kategori
- Deskripsi
- Bukti Pembayaran
- Tanggal

---

## Message

Pesan anonim.

- Message
- Created At

---

## FAQ

Pertanyaan umum.

- Question
- Answer

---

# Coding Style

- Menggunakan TypeScript Strict Mode
- Menggunakan ESLint
- Menggunakan Prettier
- Menggunakan Server Components secara default
- Gunakan Client Component hanya jika diperlukan
- Hindari penggunaan `useEffect` jika dapat menggunakan Server Component
- Semua validasi menggunakan Zod
- Semua query database menggunakan Prisma ORM
- Gunakan Server Actions untuk operasi CRUD
- Gunakan Route Handler hanya jika diperlukan (upload file, webhook, dsb.)

---

# Naming Convention

## Folder

```text
kebab-case
```

Contoh:

```text
programs
meetings
finance
```

---

## Component

```text
PascalCase
```

Contoh:

```tsx
Hero.tsx
ProgramCard.tsx
MeetingCard.tsx
```

---

## Function

```ts
camelCase
```

Contoh:

```ts
getPrograms()

createMeeting()

updateFinance()

deleteMessage()
```

---

# Git Branch

```text
main

develop

feature/landing-page

feature/admin

feature/finance

feature/ngl
```