# Deploy Smart Taruna ke Google Cloud Run

Dokumen ini menyiapkan deploy demo dengan:

- Next.js di Cloud Run
- MySQL di Cloud SQL
- File upload Cloud Storage ditunda dulu

## File yang sudah disiapkan

- `Dockerfile`: build Next.js standalone untuk Cloud Run.
- `.dockerignore`: mencegah `.env`, `.next`, `node_modules`, dan file lokal ikut masuk image.
- `.env.example`: daftar environment variable production.
- `next.config.js`: memakai `output: "standalone"` agar image lebih ringan.

## Variabel yang dibutuhkan

### `DATABASE_URL`

Dipakai Prisma untuk koneksi ke Cloud SQL MySQL.

Format untuk Cloud Run + Cloud SQL connector:

```env
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@localhost/DB_NAME?socket=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"
```

Cara mendapatkan nilainya:

- `PROJECT_ID`: Google Cloud Console bagian project selector, atau:
  ```bash
  gcloud config get-value project
  ```
- `REGION`: region Cloud SQL, contoh `asia-southeast2`.
- `INSTANCE_NAME`: nama instance Cloud SQL yang kamu buat, contoh `smart-taruna-mysql`.
- `DB_NAME`: nama database di Cloud SQL, contoh `smart_taruna`.
- `DB_USER`: user database yang kamu buat di Cloud SQL.
- `DB_PASSWORD`: password user database.

Contoh:

```env
DATABASE_URL="mysql://smarttaruna_user:passwordku@localhost/smart_taruna?socket=/cloudsql/smart-taruna-prod:asia-southeast2:smart-taruna-mysql"
```

### `NEXTAUTH_URL`

URL publik aplikasi production.

Cara mendapatkannya:

1. Deploy Cloud Run pertama kali.
2. Buka Cloud Run service.
3. Copy URL service, contoh:
   ```text
   https://smart-taruna-xxxxx-et.a.run.app
   ```
4. Isi `NEXTAUTH_URL` dengan URL tersebut.

Jika nanti pakai domain sendiri, ganti ke domain production, contoh:

```env
NEXTAUTH_URL="https://app.smarttaruna.id"
```

### `NEXTAUTH_SECRET`

Secret acak untuk NextAuth session/JWT.

Cara membuat:

```bash
openssl rand -base64 32
```

Kalau di Windows belum ada OpenSSL, bisa pakai Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`

Dipakai untuk login/daftar dengan Google.

Cara mendapatkan:

1. Buka Google Cloud Console.
2. Masuk ke **APIs & Services**.
3. Buka **OAuth consent screen** dan lengkapi data aplikasi.
4. Buka **Credentials**.
5. Klik **Create Credentials** -> **OAuth client ID**.
6. Pilih **Web application**.
7. Tambahkan Authorized JavaScript origins:
   ```text
   https://URL-CLOUD-RUN-KAMU
   ```
8. Tambahkan Authorized redirect URIs:
   ```text
   https://URL-CLOUD-RUN-KAMU/api/auth/callback/google
   ```
9. Copy `Client ID` ke `GOOGLE_CLIENT_ID`.
10. Copy `Client secret` ke `GOOGLE_CLIENT_SECRET`.

Jika belum ingin mengaktifkan Google login saat demo, variabel Google boleh dikosongkan. Login email/password tetap jalan.

### Variabel AWS opsional

Route upload saat ini masih memakai S3 lama:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

Untuk demo deploy awal, ini boleh dikosongkan selama fitur upload gambar/profile tidak diuji.

## Langkah setup Google Cloud

### 1. Login dan pilih project

```bash
gcloud auth login
gcloud config set project PROJECT_ID
```

### 2. Enable API yang dibutuhkan

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 3. Buat Cloud SQL MySQL

Contoh region Jakarta:

```powershell
gcloud sql instances create smart-taruna-mysql `
  --database-version=MYSQL_8_0 `
  --tier=db-f1-micro `
  --region=asia-southeast2
```

Buat database:

```powershell
gcloud sql databases create smart_taruna --instance=smart-taruna-mysql
```

Buat user:

```powershell
gcloud sql users create smarttaruna_user `
  --instance=smart-taruna-mysql `
  --password=PASSWORD_DATABASE_KAMU
```

Ambil instance connection name:

```powershell
gcloud sql instances describe smart-taruna-mysql --format="value(connectionName)"
```

Hasilnya akan seperti:

```text
PROJECT_ID:asia-southeast2:smart-taruna-mysql
```

### 4. Simpan secret production

Lebih aman simpan secret di Secret Manager. Di PowerShell, gunakan file sementara supaya nilai secret tidak berubah karena newline:

```powershell
Set-Content -NoNewline -Path .tmp-secret -Value "DATABASE_URL_KAMU"
gcloud secrets create DATABASE_URL --data-file=.tmp-secret

Set-Content -NoNewline -Path .tmp-secret -Value "NEXTAUTH_SECRET_KAMU"
gcloud secrets create NEXTAUTH_SECRET --data-file=.tmp-secret

Set-Content -NoNewline -Path .tmp-secret -Value "GOOGLE_CLIENT_ID_KAMU"
gcloud secrets create GOOGLE_CLIENT_ID --data-file=.tmp-secret

Set-Content -NoNewline -Path .tmp-secret -Value "GOOGLE_CLIENT_SECRET_KAMU"
gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=.tmp-secret

Remove-Item .tmp-secret
```

Jika secret sudah pernah dibuat dan ingin update:

```powershell
Set-Content -NoNewline -Path .tmp-secret -Value "NILAI_BARU"
gcloud secrets versions add NAMA_SECRET --data-file=.tmp-secret
Remove-Item .tmp-secret
```

### 5. Deploy ke Cloud Run

Contoh service name:

```powershell
gcloud run deploy smart-taruna `
  --source . `
  --region=asia-southeast2 `
  --allow-unauthenticated `
  --add-cloudsql-instances=PROJECT_ID:asia-southeast2:smart-taruna-mysql `
  --set-env-vars=NEXTAUTH_URL=https://URL-CLOUD-RUN-KAMU `
  --set-secrets=DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest
```

Catatan:

- Pada deploy pertama, kamu mungkin belum tahu URL Cloud Run.
- Boleh deploy dulu dengan `NEXTAUTH_URL=https://sementara`.
- Setelah deploy selesai, copy URL Cloud Run, lalu update service:

```powershell
gcloud run services update smart-taruna `
  --region=asia-southeast2 `
  --update-env-vars=NEXTAUTH_URL=https://URL-CLOUD-RUN-KAMU
```

### 6. Beri akses Cloud Run ke Cloud SQL dan Secret Manager

Cari service account Cloud Run:

```powershell
gcloud run services describe smart-taruna `
  --region=asia-southeast2 `
  --format="value(spec.template.spec.serviceAccountName)"
```

Kalau hasilnya kosong, biasanya memakai default compute service account.

Beri role:

```powershell
gcloud projects add-iam-policy-binding PROJECT_ID `
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" `
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding PROJECT_ID `
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" `
  --role="roles/secretmanager.secretAccessor"
```

### 7. Push schema Prisma ke Cloud SQL

Untuk demo cepat, gunakan:

```powershell
npx prisma db push
```

Pastikan terminal lokal memakai `DATABASE_URL` production Cloud SQL.

Jika memakai PowerShell:

```powershell
$env:DATABASE_URL="mysql://DB_USER:DB_PASSWORD@HOST_OR_SOCKET/DB_NAME"
npx prisma db push
```

Untuk koneksi lokal ke Cloud SQL, cara paling mudah adalah pakai Cloud SQL Auth Proxy. Setelah proxy jalan di `localhost:3306`, pakai:

```env
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@127.0.0.1:3306/DB_NAME"
```

### 8. Seed database

Setelah schema masuk:

```powershell
npm run seed
```

Seed juga harus memakai `DATABASE_URL` production.

## Checklist sebelum demo

- Cloud Run service bisa dibuka.
- `NEXTAUTH_URL` sudah sama dengan URL service.
- Google OAuth redirect URI sudah berisi `/api/auth/callback/google`.
- `DATABASE_URL` mengarah ke Cloud SQL.
- `npx prisma db push` sudah berhasil.
- `npm run seed` sudah berhasil jika butuh data awal.
- Login email/password berhasil.
- Token ujian bisa membuka paket.
