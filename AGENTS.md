# Aturan pengembangan Vinskanna

- Baca `docs/typography.md` sebelum mengubah teks visual atau menambah komponen UI.
- Gunakan token dan kelas peran `css/typography.css`. Jangan menambahkan ukuran
  font literal atau font CDN; pertahankan font lokal dan lisensinya.
- Urutan CSS: Bootstrap, main.css, typography.css. Jangan mengubah file vendor.
- Pertahankan karakter Vinskanna: Poppins untuk UI, Kaisei Tokumin untuk merek dan
  display, warna pink dari `--pink`. Jangan membawa identitas visual marketplace
  referensi ke dalam situs.
- Pedoman jarak ada di README. Jangan menumpuk margin/padding untuk spacer.
- Data produk tetap satu sumber di `js/products.js`; kontak/voucher di `js/config.js`.
- Checkout adalah demo. Jangan mengklaim transaksi berhasil tanpa backend.
- Perubahan UI harus dicek pada desktop dan ponsel. Perubahan logika keranjang
  perlu pengujian seleksi, jumlah, total, dan voucher sesuai cakupan perubahan.
- Ikuti scope pengguna dan pertahankan perubahan lokal yang sudah ada.
