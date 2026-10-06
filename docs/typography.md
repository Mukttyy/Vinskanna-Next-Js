# Tipografi Vinskanna

Buka `ui-kit.html` melalui server lokal untuk melihat contoh nyata. Sumber token
ada di `css/typography.css`; font disimpan lokal beserta lisensi OFL di `fonts/`.
Tidak perlu koneksi Google Fonts saat situs digunakan.

## Keluarga font

- **Poppins**: navigasi, judul bagian, produk, harga, tombol, formulir, footer.
  Bobot tersedia: 400 regular, 500 medium, 600 semibold, 700 bold.
- **Kaisei Tokumin**: nama merek, judul hero, judul banner promosi.
  Bobot tersedia: 400 dan 700. Jangan gunakan untuk nominal, formulir, atau tabel.

## Skala dan peran

Ukuran px di bawah mengacu pada root browser 16 px; implementasi menggunakan rem
agar mengikuti preferensi ukuran teks pengguna.

| Peran / kelas | Token ukuran | Desktop | Ponsel | Bobot |
|---|---|---|---|---|
| `.type-display` | `--text-display` | 32–60 | 32 minimum | 700 |
| `.type-brand` | `--text-brand` | 26 | 24 | 400 |
| `.type-section` | `--text-section` | 32 | 24 | 500 |
| `.type-subheading` | `--text-subheading` | 20 | 20 | 600 |
| `.type-body`, `.type-product` | `--text-body` | 16 | 16 | 400 |
| `.type-price` | `--text-body` | 16 | 16 | 600 |
| `.type-total` | `--text-emphasis` | 18 | 18 | 700 |
| `.type-label` | `--text-small` | 14 | 14 | 500 |
| `.type-caption` | `--text-caption` | 12 | 12 | 400 |

`--text-meta` (13 px) untuk metadata singkat. `--text-badge` (10 px) hanya angka
badge ikon. Jangan memakai keduanya untuk nama produk atau instruksi penting.
Breakpoint tipografi ponsel: <=575 px. Breakpoint tata letak mengikuti komponen;
tidak harus sama dengan breakpoint tipografi.

## Aturan implementasi

1. Urutan stylesheet: Bootstrap → `main.css` → `typography.css`. Jangan edit vendor.
2. Gunakan kelas peran untuk komponen baru; untuk komponen lama pemetaan selector
   berada di akhir `typography.css`. Ubah token di satu tempat, jangan tambah
   override ukuran font di tiap halaman.
3. Jangan menambahkan ukuran literal baru (contoh 15/19/23 px), bobot 300, atau
   `!important` baru. Skala baru harus memiliki alasan dan dicatat di dokumen ini.
4. Satu h1 untuk judul utama halaman baru; h2 bagian, h3 subbagian. Kelas visual
   tidak menentukan level heading. Jangan memilih h3 hanya untuk mengecilkan teks.
5. Nama produk dan paragraf: regular. Harga: semibold. Total: bold. Tombol dan label:
   medium. Maksimal tiga tingkat penekanan dalam satu komponen.
6. Gunakan tabular-nums pada harga, total, dan kuantitas. Format uang lewat fungsi
   `money()` yang sudah ada; jangan menambahkan pemisah ribuan secara manual.
7. Line-height judul 1.25, antarmuka 1.5, paragraf 1.65. Jangan menggunakan line-height
   atau spasi kosong untuk mengatur jarak antarbagian; gunakan pedoman spacing README.
8. Jangan mengecilkan teks agar muat. Izinkan nama produk membungkus dan tata letak
   berpindah baris. Jangan memotong informasi harga atau tombol pada ponsel.
9. Teks putih hanya pada latar yang cukup gelap. Jangan mengandalkan warna saja
   untuk pesan error atau keadaan aktif. Pertahankan label aksesibel ikon.
10. Verifikasi font benar-benar dimuat (`document.fonts.ready` dan rendered fonts),
    bukan hanya nama font dalam computed styles. Periksa 390, 992, dan 1440 px,
    zoom browser 200%, nama panjang, harga besar, dan semua bobot yang digunakan.

## Contoh

```html
<h2 class="type-section">Koleksi Pilihan</h2>
<p class="type-product">Rose Baby Breath</p>
<p class="type-price">Rp 420.000</p>
<label class="type-label" for="voucher">Kode voucher</label>
<p class="type-caption">Ongkir belum termasuk.</p>
```

Halaman kit adalah dokumentasi pengembangan, bukan menu belanja pelanggan.
Lisensi font wajib ikut ketika template disalin/didistribusikan. File font asli
mencakup karakter yang luas; bila melakukan subset/konversi di masa depan,
pertahankan lisensi dan uji glyph serta bobot lagi.
