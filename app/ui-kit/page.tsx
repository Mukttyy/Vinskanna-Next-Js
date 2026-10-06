import Link from 'next/link';
import '@/css/ui-kit.css';

export default function UIKitPage() {
  return (
    <div className="kit-page" style={{ paddingTop: '80px' }}>
      <header className="kit-header">
        <div className="container">
          <Link href="/" className="type-brand">Vinskanna</Link>
          <nav aria-label="UI kit">
            <a href="#scale">Skala</a>
            <a href="#examples">Komponen</a>
            <a href="#rules">Aturan</a>
          </nav>
        </div>
      </header>

      <main className="container kit-main">
        <section className="kit-intro">
          <p className="type-label text-primary">PANDUAN PENGEMBANGAN</p>
          <h1 className="type-display">Tipografi Vinskanna</h1>
          <p className="type-body">
            Satu sistem untuk halaman koleksi, keranjang, dan komponen berikutnya. Font lokal, ukuran terpusat, dan penekanan yang konsisten.
          </p>
          <p className="type-caption">Poppins 400 / 500 / 600 / 700 · Kaisei Tokumin 400 / 700</p>
        </section>

        <section id="scale">
          <h2 className="type-section">Skala tipografi</h2>
          <div className="kit-scale">
            <div><code>.type-display</code><p className="type-display">Bunga untuk setiap cerita</p></div>
            <div><code>.type-brand</code><p className="type-brand">Vinskanna</p></div>
            <div><code>.type-section</code><p className="type-section">Koleksi Pilihan</p></div>
            <div><code>.type-subheading</code><p className="type-subheading">Ringkasan Belanja</p></div>
            <div><code>.type-product</code><p className="type-product">Rose Baby Breath</p></div>
            <div><code>.type-body</code><p className="type-body">Rangkaian bunga untuk hadiah, perayaan, dan momen kecil yang berarti.</p></div>
            <div><code>.type-price</code><p className="type-price">Rp 420.000</p></div>
            <div><code>.type-total</code><p className="type-total">Rp 1.900.000</p></div>
            <div><code>.type-label</code><p className="type-label">Kode voucher</p></div>
            <div><code>.type-caption</code><p className="type-caption">Ongkir belum termasuk.</p></div>
          </div>
        </section>

        <section id="examples">
          <h2 className="type-section">Penggunaan dalam komponen</h2>
          <div className="kit-examples">
            <article className="kit-panel">
              <h3 className="type-subheading">Informasi produk</h3>
              <p className="type-product">Pink Blossom Delight</p>
              <p className="type-price">Rp 1.900.000</p>
              <p className="type-caption">Nama produk regular, harga semibold.</p>
              <div className="product-actions">
                <Link href="/#collection" className="btn add-to-cart">Lihat Koleksi</Link>
              </div>
            </article>

            <article className="kit-panel">
              <h3 className="type-subheading">Ringkasan Belanja</h3>
              <div className="kit-total">
                <span className="type-body">Total (2 barang)</span>
                <strong className="type-total">Rp 840.000</strong>
              </div>
              <p className="type-caption">Nominal memakai tabular-nums untuk lebar angka yang stabil.</p>
              <label className="type-label" htmlFor="kit-voucher">Kode voucher</label>
              <input id="kit-voucher" className="form-control" placeholder="Contoh: VINSKANNA10" aria-describedby="kit-hint" />
              <p id="kit-hint" className="type-caption">Contoh tampilan formulir, tidak mengklaim voucher.</p>
            </article>
          </div>
        </section>

        <section id="rules">
          <h2 className="type-section">Aturan singkat</h2>
          <ol className="type-body">
            <li>Poppins untuk UI; Kaisei Tokumin untuk merek dan judul promosi.</li>
            <li>Nama produk 16 px regular, harga 16 px semibold, total 18 px bold.</li>
            <li>Gunakan kelas peran; jangan membuat ukuran baru untuk setiap halaman.</li>
            <li>Pilih level heading berdasarkan struktur dokumen, bukan ukuran visual.</li>
            <li>Izinkan teks panjang membungkus. Periksa ponsel dan zoom 200%.</li>
          </ol>
          <p className="type-body">
            Panduan lengkap: <Link href="/docs/typography.md">docs/typography.md</Link>. Sumber token: <Link href="/css/typography.css">css/typography.css</Link>.
          </p>
        </section>
      </main>

      <footer className="kit-footer container">
        <p className="type-caption">UI kit pengembangan Vinskanna · <Link href="/">Kembali ke toko</Link></p>
      </footer>
    </div>
  );
}
