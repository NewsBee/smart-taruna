# Penyimpanan lokal dan ketahanan ujian

Upload baru disimpan di `data/uploads` pada folder proyek. Folder dibuat otomatis saat gambar pertama diunggah dan diabaikan oleh Git. `LOCAL_UPLOAD_DIR` dapat diisi dengan lokasi absolut lain, misalnya `D:/smart-taruna-media`.

Gambar dilayani oleh `/api/uploads/...` langsung dari disk, sehingga upload tidak membutuhkan restart atau build ulang. Format JPG, PNG, GIF dan WEBP diterima maksimal 5 MB; isi file diverifikasi dan disimpan sebagai WEBP. Foto profil lokal sebelumnya dihapus ketika diganti atau dikosongkan. Gambar lama yang masih menunjuk GCS tidak otomatis disalin; perlu diunggah kembali dari file aslinya.

## Ujian

- Jawaban yang belum diterima server disimpan sebagai draft browser per akun dan sesi. Draft dipulihkan ketika halaman dibuka kembali dengan sesi yang sama; pengiriman ulang dicoba setiap lima detik dan saat koneksi pulih. Halaman tetap memerlukan server untuk dimuat; fitur ini bukan mode aplikasi offline penuh.
- Timer dijeda ketika koneksi terputus dan dilanjutkan setelah heartbeat server berhasil. Server menghitung jeda dari heartbeat terakhir dan mengabaikan durasi kiriman browser. Batas total jeda per sesi dapat diatur lewat `EXAM_MAX_OFFLINE_PAUSE_MINUTES` (0 sampai 1440 menit; bawaan 5). Auto-submit server mengikuti jeda yang masih tersedia.
- Submit gagal menampilkan pesan dan tetap berada di halaman ujian. Submit ulang untuk sesi yang telah selesai mengembalikan hasil yang sama.
- Server Node memeriksa sesi kedaluwarsa setiap 15 detik melalui instrumentation Next.js, termasuk saat browser siswa tertutup. Ketika server berhenti, pemeriksaan berhenti; sesi kedaluwarsa diproses ketika server dinyalakan kembali. `EXAM_SWEEPER_ENABLED=false` hanya untuk menonaktifkan proses ini secara eksplisit.
- Penulisan jawaban dan penyelesaian sesi memakai transaksi dan kunci pada baris sesi yang sama agar autosave tidak mengubah sesi setelah selesai.

## Pemeriksaan

`npm test` menjalankan pengujian validasi, draft, dan file. `npm run test:integration` memerlukan MySQL lokal dengan izin membuat database sementara. Runner membuat database `smart_taruna_test_*`, direktori upload sementara, dan server pengujian pada port tersendiri, lalu membersihkannya. Data aplikasi utama tidak digunakan sebagai fixture.

Pengujian browser menggunakan Microsoft Edge pada Windows. Pada sistem lain, jalankan `npx playwright install chromium` terlebih dahulu. Screenshot disimpan di `test-artifacts/`.

Jalankan aplikasi seperti biasa dengan `npm run dev`. Saat nanti memakai container di VPS, folder upload harus dipasang sebagai volume permanen. Migrasi VPS dan penyalinan gambar GCS lama belum termasuk perubahan ini.
