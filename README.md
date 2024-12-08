# Aquarium v3

Sebuah platform pembelajaran bahasa Korea yang dibangun dengan [Next.js 14](https://nextjs.org) dan App Router.

## Fitur

- 🔐 Autentikasi dengan NextAuth.js
- 📚 Sistem Manajemen Kursus
- 📝 Editor Artikel dengan ProseMirror
- 🎮 Game Pembelajaran Interaktif:
  - Advanced Translate
  - EPS-TOPIK
  - Hangeul
  - Pronounce
  - Toro-toro
- 📱 Progressive Web App (PWA) Support
- 🔔 Notifikasi Push
- 📖 Kosa-kata Korea
- 👥 Manajemen Profil Pengguna
- 🎨 UI Modern dengan Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 dengan App Router
- **Autentikasi:** NextAuth.js
- **Database:** Prisma ORM
- **Styling:** Tailwind CSS
- **Editor:** ProseMirror
- **PWA:** next-pwa
- **UI Components:** Shadcn/ui
- **Type Safety:** TypeScript

## Memulai Pengembangan

1. Clone repository dan install dependencies:

```bash
git clone [repository-url]
cd aquarium-v3
npm install
```

2. Setup environment variables:

```bash
cp .env.example .env
```

3. Setup database dan jalankan migrasi:

```bash
npx prisma generate
npx prisma db push
```

4. Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dengan browser Anda untuk melihat hasilnya.

## Struktur Proyek

- `/app` - Route dan halaman aplikasi
- `/components` - Komponen React yang dapat digunakan kembali
- `/actions` - Server actions untuk operasi database
- `/lib` - Utilitas dan konfigurasi
- `/hooks` - Custom React hooks
- `/public` - Asset statis
- `/prisma` - Schema database dan migrasi
- `/schemas` - Skema validasi

## PWA Support

Aplikasi ini mendukung Progressive Web App (PWA) dengan fitur:
- Offline support
- Push notifications
- Installable pada perangkat mobile

## Lisensi

[MIT License](LICENSE)
