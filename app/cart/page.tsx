'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreState, money, maxQuantity } from '@/lib/store';
import { setCheckoutSelectedIds } from '@/lib/orderStore';
import { storeConfig } from '@/data/config';
import { notify } from '@/components/StatusToast';

export default function CartPage() {
  const router = useRouter();
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleProceedToCheckout = () => {
    if (currentSelected.size === 0) {
      notify('Pilih minimal 1 produk untuk checkout.', 'warning');
      return;
    }
    setCheckoutSelectedIds(Array.from(currentSelected));
    if (typeof window !== 'undefined') {
      if (claimedVoucher) {
        window.sessionStorage.setItem('vinskanna:checkout_voucher', JSON.stringify(claimedVoucher));
      } else {
        window.sessionStorage.removeItem('vinskanna:checkout_voucher');
      }
    }
    router.push('/checkout');
  };

  const selectedItems = cart.filter((item) => currentSelected.has(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = claimedVoucher ? Math.min(subtotal, Math.floor((subtotal * claimedVoucher.percent) / 100)) : 0;
  const grandTotal = subtotal - discount;
  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isLoaded) {
    return (
      <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-page min-h-[60vh]">
        <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
          <div className="title text-center mb-4">
            <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
              Keranjang Belanja
            </h2>
          </div>
          <div id="cart-content" className="mt-6 text-center py-12">
            <p className="text-[#6c757d]">Memuat keranjang...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-page min-h-[60vh]">
      <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="title text-center mb-4">
          <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
            Keranjang Belanja
          </h2>
        </div>

        <div id="cart-content" className="mt-6">
          {cart.length === 0 ? (
            <div className="cart-empty bg-white border border-[#ece6e8] rounded-card py-12 px-6 text-center">
              <h3 className="text-[1.25rem] font-medium leading-[1.25] text-[#212529] mb-2">
                Keranjang Anda masih kosong
              </h3>
              <p className="text-base font-normal leading-[1.65] text-[#212529] mb-4">
                Pilih buket untuk momen istimewa Anda.
              </p>
              <Link
                href="/#collection"
                className="btn inline-block bg-white text-[#555555] py-[10px] px-7 rounded-pill border border-[#555555] text-base font-medium leading-normal hover:bg-pink hover:text-white hover:border-pink transition-colors duration-180"
              >
                Jelajahi Koleksi
              </Link>
            </div>
          ) : (
            <div className="cart-layout grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">
              <div className="cart-items flex flex-col gap-0 min-w-0">
                <div className="cart-toolbar bg-white border border-[#ece6e8] rounded-lg mb-3 p-4 md:p-5 text-[0.8125rem] flex md:grid md:grid-cols-[minmax(210px,1fr)_110px_108px_115px_70px] gap-3 items-center justify-between md:justify-normal">
                  <label className="cart-select-all flex items-center gap-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-pink w-[18px] h-[18px] shrink-0 cursor-pointer"
                      checked={allSelected}
                      aria-label={`Pilih semua ${cart.length} produk`}
                      onChange={(e) => handleToggleAll(e.target.checked)}
                    />
                    <span>Produk</span>
                  </label>
                  <span className="cart-column-label hidden md:block text-center text-[#767078]">Harga Satuan</span>
                  <span className="cart-column-label hidden md:block text-center text-[#767078]">Kuantitas</span>
                  <span className="cart-column-label hidden md:block text-center text-[#767078]">Total Harga</span>
                  <span className="cart-column-label hidden md:block text-center text-[#767078]">Aksi</span>
                </div>

                <div className="cart-store-heading flex items-center gap-3 p-4 md:px-5 md:py-4 bg-white border border-[#ece6e8] rounded-t-lg">
                  <strong className="font-bold text-[#212529]">{storeConfig.name}</strong>
                  <span className="text-[#767078] text-[0.8125rem]">{cart.length} produk</span>
                  <button
                    type="button"
                    className="cart-text-button ml-auto bg-transparent border-0 text-[#68616a] hover:text-pink disabled:opacity-40 disabled:cursor-not-allowed p-2 text-sm transition-colors"
                    aria-label="Hapus produk terpilih"
                    disabled={currentSelected.size === 0}
                    onClick={() => {
                      removeSelectedCart(Array.from(currentSelected));
                      notify('Produk terpilih dihapus dari keranjang.', 'info');
                    }}
                  >
                    Hapus
                  </button>
                </div>

                {cart.map((p) => {
                  const isChecked = currentSelected.has(p.id);
                  const isWishlisted = wishlist.some((w) => w.id === p.id);

                  return (
                    <article key={p.id} className="cart-item bg-white border border-[#ece6e8] border-t-0 first:rounded-t-none last:rounded-b-lg p-4 md:p-5 grid grid-cols-2 md:grid-cols-[minmax(210px,1fr)_110px_108px_115px_70px] gap-4 md:gap-3 items-center">
                      <div className="cart-product-cell col-span-2 md:col-span-1 flex items-center gap-4 min-w-0">
                        <input
                          type="checkbox"
                          className="cart-item-select accent-pink w-[18px] h-[18px] shrink-0 cursor-pointer"
                          checked={isChecked}
                          aria-label={`Pilih ${p.name}`}
                          onChange={(e) => handleToggleItem(p.id, e.target.checked)}
                        />
                        <img
                          src={p.image}
                          alt={p.name}
                          className="cart-item-image w-[64px] h-[86px] object-cover rounded-lg shrink-0"
                          width={64}
                          height={86}
                        />
                        <div className="cart-item-details min-w-0">
                          <h3 className="m-0 text-sm font-normal break-words text-[#212529]">{p.name}</h3>
                        </div>
                      </div>

                      <div className="cart-item-price text-left md:text-center text-sm block" data-label="Harga Satuan">
                        {money(p.price)}
                      </div>

                      <div className="cart-quantity inline-flex items-center justify-self-end md:justify-self-center border border-[#d9cdd1] rounded-[24px] overflow-hidden" aria-label={`Kuantitas ${p.name}`}>
                        <button
                          type="button"
                          className="cart-quantity-button w-[34px] h-[36px] p-0 text-[1.25rem] bg-transparent border-0 text-[#68616a] hover:text-pink disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          aria-label={`Kurangi ${p.name}`}
                          disabled={p.quantity <= 1}
                          onClick={() => updateCartQuantity(p.id, p.quantity - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="quantity-input w-[38px] min-w-0 border-0 text-center p-0 bg-transparent text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          className="cart-quantity-button w-[34px] h-[36px] p-0 text-[1.25rem] bg-transparent border-0 text-[#68616a] hover:text-pink disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          aria-label={`Tambah ${p.name}`}
                          disabled={p.quantity >= maxQuantity}
                          onClick={() => updateCartQuantity(p.id, p.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <strong className="cart-line-total text-left md:text-center text-[#c9254c] text-sm font-semibold tabular-nums" data-label="Total Harga">
                        {money(p.price * p.quantity)}
                      </strong>

                      <div className="cart-item-actions col-span-2 md:col-span-1 flex justify-end md:justify-center items-center gap-0.5">
                        <button
                          type="button"
                          className={`cart-icon-button wishlist-toggle w-[34px] h-[34px] inline-flex items-center justify-center bg-transparent border-0 p-1.5 transition-colors ${
                            isWishlisted ? 'text-pink' : 'text-[#68616a] hover:text-pink'
                          }`}
                          data-id={p.id}
                          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                          title={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                          aria-pressed={isWishlisted}
                          onClick={() => {
                            const res = toggleWishlist(p.id);
                            notify(res.message, res.active ? 'success' : 'info');
                          }}
                        >
                          <svg
                            className="product-action-icon shrink-0"
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
                          className="cart-icon-button cart-remove-button w-[34px] h-[34px] inline-flex items-center justify-center bg-transparent border-0 p-1.5 text-[#dc3545] hover:text-[#b02a37] transition-colors"
                          aria-label={`Hapus ${p.name}`}
                          title="Hapus produk"
                          onClick={() => {
                            removeCartItem(p.id);
                            notify('Produk dihapus dari keranjang.', 'info');
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

              <aside className="cart-summary bg-white border border-[#ece6e8] rounded-card p-4 sm:p-6 static xl:sticky xl:top-[calc(var(--navbar-height,100px)+24px)]" aria-labelledby="cart-summary-title">
                <h3 id="cart-summary-title" className="text-[1.25rem] font-semibold leading-normal text-[#212529] mb-6">Ringkasan Belanja</h3>

                <form className="voucher-form border-b border-[#ece6e8] pb-5 mb-5" onSubmit={handleClaimVoucher}>
                  <label htmlFor="voucher-code" className="block text-sm mb-2 text-[#212529]">Kode voucher</label>
                  <div className="voucher-input-row flex gap-2">
                    <input
                      id="voucher-code"
                      type="text"
                      className="form-control min-w-0 rounded-[24px] text-sm py-2 px-4 border border-[#ced4da] focus:border-pink focus:outline-none flex-1"
                      placeholder="Masukkan kode"
                      maxLength={40}
                      autoComplete="off"
                      aria-describedby="voucher-message"
                      aria-invalid={voucherError}
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button type="submit" className="btn voucher-claim bg-pink hover:bg-pink-hover text-white py-2 px-4 text-sm font-medium rounded-pill border border-pink transition-colors">
                      Klaim
                    </button>
                  </div>
                  <p className="voucher-hint text-xs text-[#767078] mt-2.5">Coba VINSKANNA10 untuk diskon demo 10%.</p>
                  {voucherMessage && (
                    <p id="voucher-message" className={`voucher-message text-xs mt-2.5 ${voucherError ? 'text-[#c9254c]' : 'text-green-600'}`} role="status">
                      {voucherMessage}
                    </p>
                  )}
                  {claimedVoucher && (
                    <button
                      type="button"
                      className="cart-text-button voucher-remove text-xs text-[#c9254c] pt-2 hover:underline block cursor-pointer bg-transparent border-0"
                      onClick={handleRemoveVoucher}
                    >
                      Hapus voucher
                    </button>
                  )}
                </form>

                {claimedVoucher && (
                  <>
                    <div className="cart-summary-total voucher-breakdown flex justify-between items-baseline gap-3 text-sm mb-3">
                      <span>Subtotal</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="cart-summary-total voucher-discount flex justify-between items-baseline gap-3 text-sm mb-3 text-[#c9254c]">
                      <span>Potongan voucher</span>
                      <span>− {money(discount)}</span>
                    </div>
                  </>
                )}

                <div className="cart-summary-total flex justify-between items-baseline gap-3 pt-1 mb-3">
                  <span className="text-[#212529] text-base">Total ({totalItemCount} barang)</span>
                  <strong className="cart-total text-[1.125rem] font-bold text-[#212529] tabular-nums" aria-live="polite">
                    {money(grandTotal)}
                  </strong>
                </div>

                <p className="cart-shipping-note text-[0.8125rem] text-[#767078] mb-6">Ongkir dihitung saat proses checkout.</p>
                <button
                  type="button"
                  className="btn cart-checkout w-full bg-pink hover:bg-[#cf274c] text-white border border-pink text-sm font-medium py-3 px-4 rounded-pill transition-colors duration-180 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSelected.size === 0}
                  onClick={handleProceedToCheckout}
                >
                  {currentSelected.size === 0 ? 'Pilih Produk untuk Checkout' : `Checkout (${totalItemCount})`}
                </button>
                <p className="cart-demo-note text-center mt-4 text-xs text-[#767078]">
                  Pembayaran via Transfer Bank dengan audit manual.
                </p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
