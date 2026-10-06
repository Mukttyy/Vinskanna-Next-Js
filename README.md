"# Vinskanna_Web" 
"# Vinskanna" 
"# Vinskanna" 

## Vinskanna — template storefront

Template situs katalog buket bunga statis, tanpa backend atau proses pembayaran.
Keranjang dan wishlist disimpan pada browser yang sama melalui localStorage.
Checkout dan newsletter belum terhubung ke layanan nyata; situs tidak mengirim pesanan.

### Menjalankan

Dari folder proyek:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Buka http://127.0.0.1:8765. Gunakan server HTTP, bukan membuka file HTML langsung.
Hosting cukup melayani HTML, folder `css`, `js`, `images`, dan `bootstrap-5.0.2-dist`.

### Membuat template toko lain

1. Salin folder proyek tanpa `.git` dan `node_modules`, lalu buat repository baru.
2. Ubah nama, kontak, namespace penyimpanan, dan batas jumlah di `js/config.js`.
3. Ubah katalog di `js/products.js`: ID unik dan stabil, nama, harga integer Rupiah,
   gambar lokal, kategori `best`/`feat`/`new`/`special`, serta tags pencarian.
   Beranda dan pencarian memakai katalog yang sama.
4. Ganti gambar di `images`, banner pada `css/main.css`, warna `--pink`, serta
   teks editorial pada HTML. Gunakan aset yang hak penggunaannya sudah Anda miliki.
5. Jalankan pengujian dan periksa tampilan desktop serta ponsel sebelum publikasi.

`js/store.js` memvalidasi penyimpanan; `js/app.js` menangani antarmuka bersama.
Tidak ada dependensi CDN untuk menjalankan situs. Bootstrap disertakan lokal;
pertahankan informasi lisensinya. jQuery lama tidak lagi dimuat oleh halaman.

### Pengujian

Node.js 22+:

```sh
npm ci
npm test
# Jalankan server HTTP di atas pada terminal lain, kemudian:
npm run test:browser
```

Tes browser memakai Google Chrome di `/usr/bin/google-chrome`.
Untuk lokasi lain: `BROWSER_PATH=/lokasi/chrome npm run test:browser`.
Tes memeriksa filter, tambah/hapus keranjang, wishlist, jumlah/total, pencarian,
input HTML berbahaya, data rusak, penyimpanan ditolak, dan overflow ponsel.

### Batas penggunaan

Ini template demo, belum toko transaksi produksi. Untuk menerima pesanan nyata,
perlu backend yang memvalidasi harga/stok, menyimpan pesanan, dan mengonfirmasi
hasil pembayaran. Data pada browser dapat diubah pengguna dan bukan sumber
kebenaran transaksi. Data demo lama dari `shoppingCart`/`wishlist` tidak dimigrasi
karena struktur katalog sebelumnya berbeda. Menghapus data browser menghapus
keranjang dan wishlist. Tidak ada jaminan nol bug atau nol risiko.

### Pedoman jarak beranda

- `main.storefront-layout` menjadi satu-satunya pengatur jarak luar: 84 px pada
  layar >= 768 px, 40 px pada layar lebih kecil. Berlaku dari hero ke koleksi,
  antarsemua section, hingga banner terakhir ke footer.
- Judul ke konten: 46 px desktop, 24 px ponsel. Koleksi memakai jarak ini menuju
  filter, kemudian 24 px dari filter ke kartu.
- Jarak baris kartu: 34 px. Jarak tombol pada kartu: 8 px.
- About memakai padding dalam 32 px desktop / 24 px ponsel agar tidak menggandakan
  jarak luar. Banner dan footer memiliki padding dalam tersendiri untuk latar dan
  kontennya; jangan menambahkan margin luar atau `<br>` sebagai spacer.
- Ubah `--section-space` dan `--heading-space` di `css/main.css` untuk mengatur
  ritme halaman secara terpusat.

### UI kit dan aturan tipografi

Buka `ui-kit.html` untuk contoh ukuran, bobot, harga, judul, dan formulir.
Aturan lengkap: [docs/typography.md](docs/typography.md). Token terpusat:
`css/typography.css`. Font Poppins dan Kaisei Tokumin dimuat dari folder `fonts/`
(beserta lisensi), bukan CDN. Sertakan folder font saat deploy atau menyalin template.
Aturan untuk pengembangan berikutnya juga dicatat dalam `AGENTS.md`.
