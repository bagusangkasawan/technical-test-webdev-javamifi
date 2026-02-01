# 🏢 ERP-Mate

Sistem Enterprise Resource Planning (ERP) modern dan profesional yang dibangun dengan React, TypeScript, Node.js, Express, dan MongoDB. Dilengkapi dengan AI Assistant menggunakan Google Gemini.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square)

## ✨ Fitur Utama

### 📦 Manajemen Inventaris
- CRUD produk lengkap
- Pelacakan stok dengan peringatan stok rendah
- Manajemen kategori dan supplier
- Fitur pencarian dan filter

### 💰 Keuangan & Arus Kas
- Pencatatan pemasukan dan pengeluaran
- Manajemen transaksi
- Laporan keuangan bulanan
- Analisis laba/rugi dengan grafik visual

### 📋 Manajemen Proyek & Tugas
- Pembuatan dan pelacakan proyek
- Penugasan tugas dan monitoring progress
- Manajemen prioritas dan status
- Fitur kolaborasi tim

### 👥 Manajemen Pengguna
- Kontrol akses berbasis role (Admin, Manager, Staff)
- Autentikasi pengguna dengan JWT
- Manajemen profil
- Organisasi departemen

## 🔒 Sistem Akses Berbasis Role

Aplikasi ini mengimplementasikan kontrol akses berbasis role sesuai standar industri ERP:

| Modul | Admin | Manager | Staff |
|-------|-------|---------|-------|
| **Dashboard** | ✅ Full analytics | ✅ Full analytics | ⚠️ Terbatas (tanpa data keuangan) |
| **Manajemen Pengguna** | ✅ Full CRUD | ❌ Tidak dapat diakses | ❌ Tidak dapat diakses |
| **Inventaris** | ✅ Full CRUD | ✅ Full CRUD | 👁️ Hanya lihat |
| **Keuangan** | ✅ Full CRUD | ✅ Full CRUD | ❌ Tidak dapat diakses (data sensitif) |
| **Proyek** | ✅ Full CRUD | ✅ Full CRUD | ⚠️ Lihat & toggle tugas saja |

### Detail Akses per Role:

**🔴 Admin (Administrator)**
- Akses penuh ke semua modul
- Dapat mengelola pengguna dan role
- Dapat menghapus data di semua modul

**🟡 Manager**
- Akses ke Dashboard, Inventaris, Keuangan, dan Proyek
- Dapat membuat, mengedit, dan mengelola data
- Tidak dapat menghapus data tertentu (hanya admin)
- Tidak dapat mengakses Manajemen Pengguna

**🟢 Staff**
- Akses terbatas ke Dashboard (tanpa data keuangan)
- Inventaris: Hanya dapat melihat data produk
- Proyek: Dapat melihat proyek dan menandai tugas selesai
- Tidak dapat mengakses Keuangan dan Manajemen Pengguna

### 🤖 AI Assistant (Gemini)
- Pertanyaan menggunakan bahasa natural
- Insight bisnis real-time
- Analisis data dan rekomendasi
- Respons berdasarkan konteks

## 🛠️ Tech Stack

### Frontend
- **React 19** - Library UI
- **TypeScript** - Type Safety
- **Tailwind CSS 4** - Styling
- **Vite** - Build Tool
- **Lucide React** - Ikon

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Autentikasi
- **bcrypt** - Password Hashing
- **Google Generative AI** - AI Assistant

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- MongoDB
- pnpm (disarankan) atau npm
- Google Gemini API Key

### Instalasi

1. **Clone repository**
```bash
git clone https://github.com/bagusangkasawan/technical-test-webdev-javamifi.git
cd "https://github.com/bagusangkasawan/technical-test-webdev-javamifi"
```

2. **Setup Backend**
```bash
cd backend
pnpm install

# Buat file .env
echo "PORT=5000
MONGO_URI=mongodb://localhost:27017/erp-mate
JWT_SECRET=rahasia-super-aman
GEMINI_API_KEY=api-key-gemini-anda" > .env

# Jalankan backend
pnpm dev
```

3. **Setup Frontend**
```bash
cd ../frontend
pnpm install

# Jalankan frontend
pnpm dev
```

4. **Akses aplikasi**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Struktur Proyek

```
├── backend/
│   ├── src/
│   │   ├── config/       # Konfigurasi database & AI
│   │   ├── controllers/  # Handler request
│   │   ├── middleware/   # Middleware autentikasi
│   │   ├── models/       # Model Mongoose
│   │   ├── routes/       # API routes
│   │   └── server.ts     # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Komponen UI reusable
│   │   │   ├── layout/   # Sidebar, Header
│   │   │   └── ui/       # Button, Card, Modal, dll
│   │   ├── hooks/        # Custom React hooks
│   │   ├── modules/      # Modul fitur
│   │   │   ├── auth/     # Login
│   │   │   ├── chatbot/  # AI Assistant
│   │   │   ├── dashboard/# Dashboard utama
│   │   │   ├── finance/  # Modul keuangan
│   │   │   ├── inventory/# Modul inventaris
│   │   │   ├── projects/ # Modul proyek
│   │   │   └── users/    # Manajemen pengguna
│   │   ├── services/     # API service
│   │   └── App.tsx       # Aplikasi utama
│   └── package.json
│
└── README.md
```

## 🔐 API Endpoints

### Autentikasi
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna
- `GET /api/auth/profile` - Ambil profil pengguna
- `PUT /api/auth/password` - Update password

### Inventaris
- `GET /api/inventory` - Ambil semua produk
- `GET /api/inventory/:id` - Ambil produk berdasarkan ID
- `POST /api/inventory` - Buat produk baru
- `PUT /api/inventory/:id` - Update produk
- `DELETE /api/inventory/:id` - Hapus produk
- `GET /api/inventory/stats` - Ambil statistik inventaris

### Keuangan
- `GET /api/finance` - Ambil semua transaksi
- `POST /api/finance` - Buat transaksi baru
- `GET /api/finance/summary` - Ambil ringkasan keuangan
- `GET /api/finance/monthly` - Ambil laporan bulanan

### Proyek
- `GET /api/projects` - Ambil semua proyek
- `POST /api/projects` - Buat proyek baru
- `PUT /api/projects/:id` - Update proyek
- `POST /api/projects/:id/tasks` - Tambah tugas ke proyek
- `PATCH /api/projects/:id/tasks/:taskId/toggle` - Toggle status tugas

### Chat (AI)
- `POST /api/chat` - Kirim pesan ke AI
- `GET /api/chat/sessions` - Ambil sesi chat
- `GET /api/chat/history/:sessionId` - Ambil riwayat chat

## 👤 Kredensial Demo

```
Admin:
Email: admin@erpmate.com
Password: admin123

Manager:
Email: manager@erpmate.com
Password: manager123

Staff:
Email: staff@erpmate.com
Password: staff123
```

## 📝 Lisensi

MIT License

---

## 👨‍💻 Author

Bagus Angkasawan Sumantri Putra - Aplikasi Sistem ERP (Technical Test)

---
