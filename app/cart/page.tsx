'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStoreState, money, maxQuantity } from '@/lib/store';
import { storeConfig } from '@/data/config';
import { notify } from '@/components/StatusToast';

export default function CartPage() {
  const {
    cart,
    wishlist,
    isLoaded,
    updateCartQuantity,
    removeCartItem,
    removeSelectedCart,
    toggleWishlist
  } = useStoreState();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [voucherCode, setVoucherCode] = useState('');
  const [claimedVoucher, setClaimedVoucher] = useState<{ code: string; percent: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [voucherError, setVoucherError] = useState(false);

  // Sync selectedIds with cart items
  const currentSelected = useMemo(() => {
    const valid = new Set<string>();
    cart.forEach((item) => {
      // Default to selected if not previously explicitly unselected
      if (!selectedIds.has(item.id) && selectedIds.size === 0) {
        valid.add(item.id);
      } else if (selectedIds.has(item.id)) {
        valid.add(item.id);
      }
    });
    return valid.size > 0 ? valid : new Set(cart.map((p) => p.id));
  }, [cart, selectedIds]);

  const allSelected = cart.length > 0 && currentSelected.size === cart.length;

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(cart.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleItem = (id: string, checked: boolean) => {
    const next = new Set(currentSelected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleClaimVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setVoucherMessage('Masukkan kode voucher terlebih dahulu.');
      setVoucherError(true);
      return;
    }
    const found = storeConfig.vouchers.find((v) => v.code === code && v.percent > 0);
    if (!found) {
      setVoucherMessage('Kode voucher tidak valid.');
      setVoucherError(true);
      return;
    }
    if (currentSelected.size === 0) {
      setVoucherMessage('Pilih minimal satu produk terlebih dahulu.');
      setVoucherError(true);
      return;
    }

    setClaimedVoucher({ code: found.code, percent: found.percent });
    setVoucherMessage(`${found.code} aktif: diskon ${found.percent}%.`);
    setVoucherError(false);
  };

  const handleRemoveVoucher = () => {
    setClaimedVoucher(null);
    setVoucherCode('');
    setVoucherMessage('');
    setVoucherError(false);
  };

  const selectedItems = cart.filter((item) => currentSelected.has(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = claimedVoucher ? Math.min(subtotal, Math.floor((subtotal * claimedVoucher.percent) / 100)) : 0;
  const grandTotal = subtotal - discount;
  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isLoaded) {
    return (
      <main id="cart" className="cart-page">
        <div className="container">
          <div className="title text-center">
            <h2 className="position-relative d-inline-block">Keranjang Belanja</h2>
          </div>
          <div id="cart-content" className="mt-4 text-center">
            <p className="text-muted">Memuat keranjang...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="cart" className="cart-page">
      <div className="container">
        <div className="title text-center">
          <h2 className="position-relative d-inline-block">Keranjang Belanja</h2>
        </div>

        <div id="cart-content" className="mt-4">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <h3>Keranjang Anda masih kosong</h3>
              <p>Pilih buket untuk momen istimewa Anda.</p>
              <Link href="/#collection" className="btn">
                Jelajahi Koleksi
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="cart-toolbar">
                  <label className="cart-select-all">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      aria-label={`Pilih semua ${cart.length} produk`}
                      onChange={(e) => handleToggleAll(e.target.checked)}
                    />
                    <span>Produk</span>
                  </label>
                  <span className="cart-column-label">Harga Satuan</span>
                  <span className="cart-column-label">Kuantitas</span>
                  <span className="cart-column-label">Total Harga</span>
                  <span className="cart-column-label">Aksi</span>
                </div>

                <div className="cart-store-heading">
                  <strong>{storeConfig.name}</strong>
                  <span>{cart.length} produk</span>
                  <button
                    type="button"
                    className="cart-text-button"
                    aria-label="Hapus produk terpilih"
                    disabled={currentSelected.size === 0}
                    onClick={() => {
                      removeSelectedCart(Array.from(currentSelected));
                      notify('Produk terpilih dihapus dari keranjang.');
                    }}
                  >
                    Hapus
                  </button>
                </div>

                {cart.map((p) => {
                  const isChecked = currentSelected.has(p.id);
                  const isWishlisted = wishlist.some((w) => w.id === p.id);

                  return (
                    <article key={p.id} className="cart-item">
                      <div className="cart-product-cell">
                        <input
                          type="checkbox"
                          className="cart-item-select"
                          checked={isChecked}
                          aria-label={`Pilih ${p.name}`}
                          onChange={(e) => handleToggleItem(p.id, e.target.checked)}
                        />
                        <img
                          src={p.image}
                          alt={p.name}
                          className="cart-item-image"
                          width={90}
                          height={120}
                        />
                        <div className="cart-item-details">
                          <h3>{p.name}</h3>
                        </div>
                      </div>

                      <div className="cart-item-price" data-label="Harga Satuan">
                        {money(p.price)}
                      </div>

                      <div className="cart-quantity" aria-label={`Kuantitas ${p.name}`}>
                        <button
                          type="button"
                          className="cart-quantity-button"
                          aria-label={`Kurangi ${p.name}`}
                          disabled={p.quantity <= 1}
                          onClick={() => updateCartQuantity(p.id, p.quantity - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="quantity-input"
                          min="1"
                          max={String(maxQuantity)}
                          step="1"
                          value={p.quantity}
                          aria-label={`Jumlah ${p.name}`}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (Number.isInteger(val) && val >= 1 && val <= maxQuantity) {
                              updateCartQuantity(p.id, val);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="cart-quantity-button"
                          aria-label={`Tambah ${p.name}`}
                          disabled={p.quantity >= maxQuantity}
                          onClick={() => updateCartQuantity(p.id, p.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <strong className="cart-line-total" data-label="Total Harga">
                        {money(p.price * p.quantity)}
                      </strong>

                      <div className="cart-item-actions">
                        <button
                          type="button"
                          className="cart-icon-button wishlist-toggle"
                          data-id={p.id}
                          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                          title={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                          aria-pressed={isWishlisted}
                          onClick={() => {
                            const res = toggleWishlist(p.id);
                            notify(res.message);
                          }}
                        >
                          <svg
                            className="product-action-icon"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill={isWishlisted ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="cart-icon-button cart-remove-button"
                          aria-label={`Hapus ${p.name}`}
                          title="Hapus produk"
                          onClick={() => {
                            removeCartItem(p.id);
                            notify('Produk dihapus dari keranjang.');
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="19"
                            height="19"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18M9 6V4h6v2M5 6l1 15h12l1-15M10 10v7M14 10v7"></path>
                          </svg>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="cart-summary" aria-labelledby="cart-summary-title">
                <h3 id="cart-summary-title">Ringkasan Belanja</h3>

                <form className="voucher-form" onSubmit={handleClaimVoucher}>
                  <label htmlFor="voucher-code">Kode voucher</label>
                  <div className="voucher-input-row">
                    <input
                      id="voucher-code"
                      type="text"
                      className="form-control"
                      placeholder="Masukkan kode"
                      maxLength={40}
                      autoComplete="off"
                      aria-describedby="voucher-message"
                      aria-invalid={voucherError}
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button type="submit" className="btn voucher-claim">
                      Klaim
                    </button>
                  </div>
                  <p className="voucher-hint">Coba VINSKANNA10 untuk diskon demo 10%.</p>
                  {voucherMessage && (
                    <p id="voucher-message" className="voucher-message" role="status">
                      {voucherMessage}
                    </p>
                  )}
                  {claimedVoucher && (
                    <button
                      type="button"
                      className="cart-text-button voucher-remove"
                      onClick={handleRemoveVoucher}
                    >
                      Hapus voucher
                    </button>
                  )}
                </form>

                {claimedVoucher && (
                  <>
                    <div className="cart-summary-total voucher-breakdown">
                      <span>Subtotal</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="cart-summary-total voucher-discount">
                      <span>Potongan voucher</span>
                      <span>− {money(discount)}</span>
                    </div>
                  </>
                )}

                <div className="cart-summary-total">
                  <span>Total ({totalItemCount} barang)</span>
                  <strong className="cart-total" aria-live="polite">
                    {money(grandTotal)}
                  </strong>
                </div>

                <p className="cart-shipping-note">Ongkir belum termasuk.</p>
                <button type="button" className="btn cart-checkout" disabled>
                  Checkout belum tersedia
                </button>
                <p className="cart-demo-note">Mode demo — pesanan dan pembayaran belum tersedia.</p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
