'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreState, money } from '@/lib/store';
import { storeConfig, BankAccount } from '@/data/config';
import {
  getCheckoutSelectedIds,
  clearCheckoutSelectedIds,
  createOrder,
  OrderItem
} from '@/lib/orderStore';
import { notify } from '@/components/StatusToast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoaded, removeSelectedCart } = useStoreState();

  const [checkoutItems, setCheckoutItems] = useState<OrderItem[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankAccount>(storeConfig.bankAccounts[0]);
  const [shippingFee] = useState<number>(25000);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState<string>('');

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize items from selection or cart
  useEffect(() => {
    if (!isLoaded) return;

    const selectedIds = getCheckoutSelectedIds();
    let itemsToProcess = cart;
    if (selectedIds && selectedIds.length > 0) {
      const idSet = new Set(selectedIds);
      itemsToProcess = cart.filter((item) => idSet.has(item.id));
    }

    setCheckoutItems(
      itemsToProcess.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      }))
    );

    // Read claimed voucher if exists
    try {
      const raw = window.sessionStorage.getItem('vinskanna:checkout_voucher');
      if (raw) {
        const parsed = JSON.parse(raw);
        setVoucherCode(parsed.code);
        const sub = itemsToProcess.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const disc = Math.min(sub, Math.floor((sub * parsed.percent) / 100));
        setVoucherDiscount(disc);
      }
    } catch {
      // ignore
    }
  }, [isLoaded, cart]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - voucherDiscount + (subtotal > 0 ? shippingFee : 0));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customer.fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi.';
    if (!customer.phone.trim()) errs.phone = 'Nomor WhatsApp / telepon wajib diisi.';
    if (!customer.city.trim()) errs.city = 'Kota / Kabupaten wajib diisi.';
    if (!customer.address.trim()) errs.address = 'Alamat lengkap pengiriman wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      notify('Tidak ada produk untuk di-checkout.', 'error');
      return;
    }

    if (!validate()) {
      notify('Mohon lengkapi formulir pengiriman.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = createOrder({
        items: checkoutItems,
        subtotal,
        discount: voucherDiscount,
        shippingFee,
        total: grandTotal,
        customer,
        bank: selectedBank
      });

      // Remove purchased items from cart
      const itemIds = checkoutItems.map((item) => item.id);
      removeSelectedCart(itemIds);
      clearCheckoutSelectedIds();
      window.sessionStorage.removeItem('vinskanna:checkout_voucher');

      notify('Pesanan berhasil dibuat! Silakan lakukan transfer.', 'success');
      router.push(`/orders/${newOrder.id}`);
    } catch (err) {
      notify('Terjadi kesalahan saat memproses pesanan.', 'error');
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="cart-page" style={{ minHeight: '60vh' }}>
        <div className="container py-5 text-center">
          <p className="text-muted">Memuat halaman checkout...</p>
        </div>
      </main>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <main className="cart-page" style={{ minHeight: '60vh' }}>
        <div className="container py-5 text-center">
          <div className="title mb-4">
            <h2 className="position-relative d-inline-block">Checkout Pesanan</h2>
          </div>
          <p className="text-muted">Tidak ada produk yang dipilih untuk checkout.</p>
          <div className="mt-4">
            <Link href="/cart" className="btn btn-primary text-white">
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page" style={{ minHeight: '75vh' }}>
      <div className="container">
        <div className="title text-center mb-5">
          <h2 className="position-relative d-inline-block">Checkout Pesanan</h2>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">
            {/* Form Pengiriman & Pembayaran (Kiri) */}
            <div className="col-lg-7">
              {/* Card 1: Data Pengiriman */}
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#ffffff' }}>
                <h3 className="h5 fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  1. Alamat Pengiriman
                </h3>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="fullName" className="form-label fw-medium" style={{ fontSize: 'var(--text-small)' }}>
                      Nama Penerima <span className="text-danger">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      placeholder="Contoh: Rina Melati"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label fw-medium" style={{ fontSize: 'var(--text-small)' }}>
                      No. WhatsApp / Telepon <span className="text-danger">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="Contoh: 081234567890"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="col-md-8">
                    <label htmlFor="city" className="form-label fw-medium" style={{ fontSize: 'var(--text-small)' }}>
                      Kota / Kabupaten <span className="text-danger">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      placeholder="Contoh: Jakarta Selatan"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="postalCode" className="form-label fw-medium" style={{ fontSize: 'var(--text-small)' }}>
                      Kode Pos
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className="form-control"
                      placeholder="12345"
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="form-label fw-medium" style={{ fontSize: 'var(--text-small)' }}>
                      Alamat Lengkap & Patokan <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan patokan..."
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="notes" className="form-label fw-medium" style={{ fontSize: 'var(--text-small)' }}>
                      Catatan untuk Florist / Kartu Ucapan (Opsional)
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      className="form-control"
                      placeholder="Tuliskan ucapan untuk kartu atau permintaan khusus warna pita..."
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Metode Pembayaran Transfer Bank */}
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#ffffff' }}>
                <h3 className="h5 fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  2. Metode Pembayaran: Transfer Bank
                </h3>

                <p className="text-muted mb-3" style={{ fontSize: 'var(--text-small)' }}>
                  Pilih rekening tujuan transfer bank. Setelah pesanan dibuat, Anda dapat mentransfer dan mengunggah bukti untuk diaudit/diverifikasi manual oleh florist.
                </p>

                <div className="row g-3">
                  {storeConfig.bankAccounts.map((bank) => {
                    const isSelected = selectedBank.id === bank.id;
                    return (
                      <div key={bank.id} className="col-sm-6">
                        <label
                          className={`card p-3 h-100 cursor-pointer text-start transition-all ${
                            isSelected ? 'border-primary shadow-sm' : 'border'
                          }`}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? 'rgba(254, 161, 172, 0.08)' : '#ffffff',
                            borderColor: isSelected ? '#fea1ac' : '#e9ecef',
                            borderWidth: isSelected ? '2px' : '1px'
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="badge bg-dark px-2 py-1 fw-bold">{bank.bankName}</span>
                            <input
                              type="radio"
                              name="bankAccount"
                              className="form-check-input mt-0"
                              checked={isSelected}
                              onChange={() => setSelectedBank(bank)}
                            />
                          </div>
                          <div className="fw-bold font-monospace" style={{ fontSize: 'var(--text-small)' }}>
                            {bank.accountNumber}
                          </div>
                          <div className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                            a/n {bank.accountHolder}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ringkasan Belanja (Kanan) */}
            <div className="col-lg-5">
              <aside className="card border-0 shadow-sm rounded-3 p-4 position-sticky" style={{ top: 'calc(var(--navbar-height, 100px) + 20px)', background: '#ffffff' }}>
                <h3 className="h5 fw-bold mb-3 pb-2 border-bottom">Ringkasan Pesanan</h3>

                <div className="order-items-list mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                      <img
                        src={item.image}
                        alt={item.name}
                        width={54}
                        height={64}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div className="flex-grow-1">
                        <h4 className="h6 mb-1 text-truncate" style={{ maxWidth: '180px' }}>
                          {item.name}
                        </h4>
                        <div className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                          {item.quantity} × {money(item.price)}
                        </div>
                      </div>
                      <div className="fw-semibold font-monospace" style={{ fontSize: 'var(--text-small)' }}>
                        {money(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between py-1" style={{ fontSize: 'var(--text-small)' }}>
                  <span className="text-muted">Subtotal ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} barang)</span>
                  <span className="font-monospace">{money(subtotal)}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="d-flex justify-content-between py-1 text-success" style={{ fontSize: 'var(--text-small)' }}>
                    <span>Diskon Voucher ({voucherCode})</span>
                    <span className="font-monospace">− {money(voucherDiscount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between py-1" style={{ fontSize: 'var(--text-small)' }}>
                  <span className="text-muted">Ongkir (Kurir Florist)</span>
                  <span className="font-monospace">{money(shippingFee)}</span>
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold">Total Pembayaran</span>
                  <strong className="fs-5 text-primary font-monospace fw-bold" style={{ color: '#e83e8c' }}>
                    {money(grandTotal)}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="btn cart-checkout checkout-submit-btn w-100 py-3 fw-semibold text-white shadow-sm"
                  style={{ borderRadius: '10px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan & Bayar via Transfer'}
                </button>

                <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 'var(--text-caption)' }}>
                  Sistem audit manual: Verifikasi pembayaran dilakukan setelah konfirmasi transfer.
                </p>
              </aside>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
