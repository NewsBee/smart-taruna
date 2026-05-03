# Alur Demo Production Lokal

Branch lokal untuk demo production: `prod`.

File env lokal yang dipakai:

```text
.env.production.local
```

File tersebut sudah dibuat di mesin ini dan sudah di-ignore oleh git, jadi tidak ikut commit/push.

## Yang masih perlu kamu pastikan

Saya sudah mengisi `DATABASE_URL` lokal dengan asumsi:

- Database user: `smarttaruna_user`
- Database name: `smart_taruna`
- Cloud SQL instance: `smarttaruna-495205:asia-southeast2:smart-taruna-mysql`
- Koneksi lokal melalui Cloud SQL Auth Proxy di `127.0.0.1:3307`

Kalau nama user atau database di Cloud SQL berbeda, ubah `.env.production.local`.

## Urutan menjalankan demo lokal ke Cloud SQL

### 1. Install Google Cloud CLI

Download dan install:

```text
https://cloud.google.com/sdk/docs/install
```

Setelah install, buka terminal baru lalu cek:

```powershell
gcloud --version
```

Login:

```powershell
gcloud auth login
gcloud config set project smarttaruna-495205
```

### 2. Install Cloud SQL Auth Proxy

Download:

```text
https://cloud.google.com/sql/docs/mysql/connect-auth-proxy
```

Pastikan command ini bisa dipanggil:

```powershell
cloud-sql-proxy --version
```

### 3. Jalankan proxy database

Buka terminal pertama:

```powershell
.\scripts\start-cloud-sql-proxy.ps1
```

Biarkan terminal ini tetap terbuka.

Script ini memakai port `3307` karena port `3306` sering sudah dipakai MySQL lokal.

### 4. Push schema dan seed database

Buka terminal kedua:

```powershell
.\scripts\prod-local-prisma.ps1 -Seed
```

Kalau tidak ingin seed:

```powershell
.\scripts\prod-local-prisma.ps1
```

### 5. Build dan jalankan mode production lokal

Masih di terminal kedua:

```powershell
npm run build
npm run start
```

Aplikasi akan berjalan di:

```text
http://localhost:3000
```

## Catatan Google Login

Untuk demo lokal dengan Google OAuth, tambahkan di Google Cloud Console:

Authorized JavaScript origins:

```text
http://localhost:3000
```

Authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
```

Lalu isi:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

di `.env.production.local`.

Kalau Google Login belum diisi, aplikasi masih bisa demo memakai login email/password.
