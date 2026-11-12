# Panduan Setup Google Apps Script & Google Sheets
## Sistem BSTB Mitra Multi Packaging

ID Spreadsheet Target: `1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y`
URL Web App: `https://script.google.com/macros/s/AKfycbzZfe6wVyo2pZbTdt-NMYL6itq5vi3_siWrj5yRZ6J34Vjq5KegSsqjB1saB9mxt9YJ/exec`

---

### Langkah 1: Buka Script Editor di Google Spreadsheet
1. Buka Google Spreadsheet Anda (ID: `1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y`).
2. Klik menu **Ekstensi (Extensions)** &rarr; **Apps Script**.

---

### Langkah 2: Salin Kode `kode.gs`
1. Di dalam project Apps Script, buka file `Code.gs` (atau buat file baru bernama `kode.gs`).
2. Hapus seluruh isi default, lalu paste kode dari file `google-apps-script/kode.gs`.
3. Klik tombol **Save (Simpan)**.

---

### Langkah 3: Tambahkan File `index.html`
1. Di panel kiri Apps Script (bagian Files), klik tanda **+** &rarr; pilih **HTML**.
2. Beri nama: `index`.
3. Salin dan tempel kode dari file `google-apps-script/index.html`.
4. Klik **Save (Simpan)**.

---

### Langkah 4: Jalankan Setup Sheet Otomatis (1x Saja)
1. Di toolbar atas Apps Script, pada dropdown fungsi pilih fungsi: **`setupSheet`**.
2. Klik tombol **Run (Jalankan)**.
3. Google akan meminta izin (*Authorization Required*):
   - Klik *Review Permissions* &rarr; Pilih akun Google Anda.
   - Klik *Advanced* &rarr; Klik *Go to (Untitled project) (unsafe)* &rarr; Klik *Allow*.
4. **Selesai!** Sheet **"Produksi"** dan Sheet **"Teknik"** akan otomatis terbuat lengkap dengan judul kolom berwarna (Teal & Biru), font tebal, dan baris atas terbekukan (*frozen header*).

---

### Langkah 5: Deploy Ulang Web App (Agar Menerima Data Terbaru)
1. Di kanan atas Apps Script, klik tombol biru **Deploy** &rarr; **Manage deployments**.
2. Klik ikon pensil (*Edit*).
3. Pada bagian *Version*, pilih **New version**.
4. Pastikan:
   - *Execute as*: **Me** (akun Anda).
   - *Who has access*: **Anyone** (Siapa saja).
5. Klik **Deploy**.
6. URL Web App Anda siap menerima data otomatis setiap kali form BSTB diselesaikan di aplikasi web!
