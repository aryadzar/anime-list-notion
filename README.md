# Notion Tracker — Manhwa & Manga Database

Aplikasi katalog pelacak bacaan Manhwa, Manga, dan Anime dengan tampilan bertema **Notion Dark Theme** yang terintegrasi langsung dengan **Notion Database API** menggunakan **TanStack React Query** dan **Elysia (Bun)**.

---

## 🏗️ Arsitektur Aplikasi

```text
[ Notion Database ]
        ▲
        │  (Notion API / @notionhq/client)
        ▼
[ Backend: Elysia + Bun ]  (port 3001)
        ▲
        │  (REST API: /api/items, /api/status)
        ▼
[ Frontend: React Router + TanStack Query ]  (port 5173)
        │
   useNotionItems() (useQuery)
```

- **Backend (`/backend`)**:
  - Runtime: **Bun**
  - Framework: **Elysia** + `@elysiajs/cors`
  - Notion SDK: `@notionhq/client`
  - Normalizer: Mengonversi properti Notion (`title`, `status`, `select`, `multi_select`, `files`, `url`, `rich_text`, `created_time`, dll.) ke objek JSON bersih.
  - Fallback Mock: Menyediakan 8 data mockup lengkap (sesuai template desain) jika API key Notion belum diisi, sehingga UI langsung tampil tanpa crash.

- **Frontend (`/frontend`)**:
  - Framework: **React 19** + **React Router v7/v8** + **Vite**
  - Data Fetching: **TanStack React Query v5** (`useQuery`)
  - Styling: **Tailwind CSS** dengan Notion Custom Scrollbar & Badge Tags
  - Views: **Table View**, **Board & Gallery View**, **List View**
  - Right Drawer: **Notion Property Inspection Panel** (Cover, Properties, Links, Comments)

---

## 🚀 Cara Menjalankan

### Cara Praktis (Sekaligus Frontend & Backend)

Cukup jalankan satu perintah di root folder:

```bash
bun run dev
```

Atau di Windows, Anda juga bisa:
- **Double click** file [`dev.bat`](file:///d:/Project%20Portofolio/anime-list-notion/dev.bat)
- Atau jalankan `.\dev.ps1` di PowerShell

Kedua server akan berjalan bersamaan:
- **Backend (Elysia)**: `http://localhost:3001`
- **Frontend (React Router)**: `http://localhost:5173`

---

### Cara Menjalankan Terpisah (Opsional)

**1. Backend Saja:**
```bash
bun run dev:backend
# atau: cd backend && bun run dev
```

**2. Frontend Saja:**
```bash
bun run dev:frontend
# atau: cd frontend && bun run dev
```

Frontend akan aktif di `http://localhost:5173`.

---

## 🔑 Cara Menghubungkan ke Notion Database Anda

1. **Buat Notion Integration**:
   - Buka [notion.so/my-integrations](https://www.notion.so/my-integrations).
   - Klik **"+ New integration"**, beri nama misalnya **"Anime Tracker"**.
   - Salin **"Internal Integration Secret"** (dimulai dengan `secret_...` atau `ntn_...`).

2. **Beri Akses ke Database Notion**:
   - Buka database Manhwa/Anime Anda di Notion.
   - Klik tombol **•••** (tiga titik) di pojok kanan atas halaman database.
   - Pilih menu **"Connect to"** (atau **"Connections"**), lalu pilih integrasi yang baru Anda buat.

3. **Dapatkan Database ID**:
   - URL database Anda di browser biasanya berbentuk:
     ```text
     https://www.notion.so/{workspace_name}/{DATABASE_ID}?v=...
     ```
   - Salin string 32 karakter hexadecimal sebelum tanda `?v=...`.

4. **Masukkan ke File `.env` Backend**:
   - Buka file [backend/.env](file:///d:/Project%20Portofolio/anime-list-notion/backend/.env) dan isi:
     ```env
     PORT=3001
     NOTION_API_KEY=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxx
     NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - Restart backend atau jalankan ulang, lalu klik tombol **Refresh/Sync** di header frontend. Data dari Notion akan otomatis tersinkronisasi!

---

## 📦 Properti Notion yang Didukung

Aplikasi secara otomatis mendeteksi kolom/properti di Notion Anda:
- **Judul**: Kolom bertipe `title` (misal: "Judul", "Name", "Title")
- **Cover**: `page.cover` bawaan Notion atau kolom bertipe `files` (misal: "Cover", "Gambar")
- **Status**: Kolom bertipe `status` atau `select` (misal: "Reading/Watching", "Completed", "On Hold", "Plan to Read")
- **Tipe**: Kolom bertipe `select` (misal: "Manhwa", "Manga", "Anime")
- **Tags**: Kolom bertipe `multi_select` (misal: "BL", "Comedy", "Romance", "Action", dll.)
- **Link & Raw/Alt Link**: Kolom bertipe `url` atau `rich_text`
- **Catatan**: Kolom bertipe `rich_text` (misal: "Catatan", "Notes")
- **Ditambahkan & Terakhir Diedit**: `created_time` & `last_edited_time`
