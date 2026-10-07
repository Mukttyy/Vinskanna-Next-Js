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
    window.scrollTo(0, 0);
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
    } catch {
      notify('Terjadi kesalahan saat memproses pesanan.', 'error');
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="cart-page mt-[var(--navbar-height,100px)] pt-6 pb-12 sm:pt-8 sm:pb-16 bg-[#faf8f9] min-h-[60vh]">
        <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px] py-12 text-center">
          <p className="text-[#6c757d] text-sm">Memuat halaman checkout...</p>
        </div>
      </main>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <main className="cart-page mt-[var(--navbar-height,100px)] pt-6 pb-12 sm:pt-8 sm:pb-16 bg-[#faf8f9] min-h-[75vh]">
        <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
          <div className="title text-center mb-6 sm:mb-8">
            <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
              Checkout Pesanan
            </h2>
          </div>
          <div className="cart-empty bg-white border border-[#ece6e8] rounded-xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs">
            <h3 className="text-lg sm:text-xl font-semibold text-[#212529] mb-2">
              Belum ada produk untuk checkout
            </h3>
            <p className="text-sm text-[#767078] mb-6">
              Pilih produk yang ingin Anda beli terlebih dahulu dari keranjang belanja.
            </p>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center font-medium transition-all rounded-[25px] !bg-pink hover:!bg-[#cf274c] !text-white !border !border-pink px-6 py-2.5 text-sm cursor-pointer shadow-xs"
            >
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page mt-[var(--navbar-height,100px)] pt-6 pb-12 sm:pt-8 sm:pb-16 bg-[#faf8f9] min-h-[75vh]">
      <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="title text-center mb-6 sm:mb-8">
          <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
            Checkout Pesanan
          </h2>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Pengiriman & Pembayaran (Kiri) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Card 1: Data Pengiriman */}
              <div className="bg-white rounded-xl shadow-sm border border-[#ece6e8]/60 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#212529] pb-3 mb-4 border-b border-[#e9ecef] flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  1. Alamat Pengiriman
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-[#212529] mb-1.5">
                      Nama Penerima <span className="text-[#dc3545]">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className={`w-full px-3.5 py-2 text-xs sm:text-sm text-[#212529] bg-white border rounded-lg transition-colors placeholder:text-[#adb5bd] focus:outline-none ${
                        errors.fullName
                          ? 'border-[#dc3545] focus:border-[#dc3545] ring-1 ring-[#dc3545]'
                          : 'border-[#ced4da] focus:border-pink focus:ring-1 focus:ring-pink'
                      }`}
                      placeholder="Contoh: Rina Melati"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    />
                    {errors.fullName && <p className="text-xs text-[#dc3545] mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="md:col-span-6">
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-[#212529] mb-1.5">
                      No. WhatsApp / Telepon <span className="text-[#dc3545]">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`w-full px-3.5 py-2 text-xs sm:text-sm text-[#212529] bg-white border rounded-lg transition-colors placeholder:text-[#adb5bd] focus:outline-none ${
                        errors.phone
                          ? 'border-[#dc3545] focus:border-[#dc3545] ring-1 ring-[#dc3545]'
                          : 'border-[#ced4da] focus:border-pink focus:ring-1 focus:ring-pink'
                      }`}
                      placeholder="Contoh: 081234567890"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-xs text-[#dc3545] mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-8">
                    <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-[#212529] mb-1.5">
                      Kota / Kabupaten <span className="text-[#dc3545]">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`w-full px-3.5 py-2 text-xs sm:text-sm text-[#212529] bg-white border rounded-lg transition-colors placeholder:text-[#adb5bd] focus:outline-none ${
                        errors.city
                          ? 'border-[#dc3545] focus:border-[#dc3545] ring-1 ring-[#dc3545]'
                          : 'border-[#ced4da] focus:border-pink focus:ring-1 focus:ring-pink'
                      }`}
                      placeholder="Contoh: Jakarta Selatan"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    />
                    {errors.city && <p className="text-xs text-[#dc3545] mt-1">{errors.city}</p>}
                  </div>

                  <div className="md:col-span-4">
                    <label htmlFor="postalCode" className="block text-xs sm:text-sm font-medium text-[#212529] mb-1.5">
                      Kode Pos
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm text-[#212529] bg-white border border-[#ced4da] rounded-lg transition-colors placeholder:text-[#adb5bd] focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink"
                      placeholder="12345"
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-12">
                    <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-[#212529] mb-1.5">
                      Alamat Lengkap & Patokan <span className="text-[#dc3545]">*</span>
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      className={`w-full px-3.5 py-2 text-xs sm:text-sm text-[#212529] bg-white border rounded-lg transition-colors placeholder:text-[#adb5bd] focus:outline-none resize-none ${
                        errors.address
                          ? 'border-[#dc3545] focus:border-[#dc3545] ring-1 ring-[#dc3545]'
                          : 'border-[#ced4da] focus:border-pink focus:ring-1 focus:ring-pink'
                      }`}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan patokan..."
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                    {errors.address && <p className="text-xs text-[#dc3545] mt-1">{errors.address}</p>}
                  </div>

                  <div className="md:col-span-12">
                    <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-[#212529] mb-1.5">
                      Catatan untuk Florist / Kartu Ucapan (Opsional)
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm text-[#212529] bg-white border border-[#ced4da] rounded-lg transition-colors placeholder:text-[#adb5bd] focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink resize-none"
                      placeholder="Tuliskan ucapan untuk kartu atau permintaan khusus warna pita..."
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Metode Pembayaran Transfer Bank */}
              <div className="bg-white rounded-xl shadow-sm border border-[#ece6e8]/60 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#212529] pb-3 mb-2 border-b border-[#e9ecef] flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink shrink-0">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  2. Metode Pembayaran: Transfer Bank
                </h3>

                <p className="text-[#6c757d] text-xs sm:text-sm mb-4 leading-relaxed">
                  Pilih rekening tujuan transfer bank. Setelah pesanan dibuat, Anda dapat mentransfer dan mengunggah bukti untuk diaudit/diverifikasi manual oleh florist.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {storeConfig.bankAccounts.map((bank) => {
                    const isSelected = selectedBank.id === bank.id;
                    return (
                      <div key={bank.id}>
                        <label
                          className={`block p-3.5 h-full rounded-xl cursor-pointer text-left transition-all duration-180 border ${
                            isSelected
                              ? 'border-[#fea1ac] bg-[#fea1ac]/[0.08] shadow-xs ring-1 ring-[#fea1ac]'
                              : 'border-[#e9ecef] bg-white hover:border-[#ced4da]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#212529] text-white">
                              {bank.bankName}
                            </span>
                            <input
                              type="radio"
                              name="bankAccount"
                              className="w-4 h-4 text-pink border-[#ced4da] focus:ring-pink accent-pink cursor-pointer"
                              checked={isSelected}
                              onChange={() => setSelectedBank(bank)}
                            />
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-[#212529] tracking-wide">
                            {bank.accountNumber}
                          </div>
                          <div className="text-[#6c757d] text-xs mt-0.5">
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
            <div className="lg:col-span-5 flex flex-col gap-6">
              <aside className="bg-white rounded-xl shadow-sm border border-[#ece6e8]/60 p-4 sm:p-6 lg:sticky lg:top-[calc(var(--navbar-height,100px)+20px)]">
                <h3 className="text-base sm:text-lg font-bold text-[#212529] pb-3 mb-3 border-b border-[#e9ecef]">
                  Ringkasan Pesanan
                </h3>

                <div className="divide-y divide-[#e9ecef] max-h-[280px] overflow-y-auto pr-1 mb-4">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        width={54}
                        height={64}
                        className="w-[54px] h-[64px] rounded-lg object-cover shrink-0 bg-[#f8f9fa]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#212529] truncate max-w-[160px] sm:max-w-none mb-0.5">
                          {item.name}
                        </h4>
                        <div className="text-[#6c757d] text-xs">
                          {item.quantity} × {money(item.price)}
                        </div>
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-[#212529] shrink-0 text-right">
                        {money(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm pt-2 border-t border-[#e9ecef]">
                  <div className="flex justify-between py-1">
                    <span className="text-[#6c757d]">
                      Subtotal ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} barang)
                    </span>
                    <span className="font-mono text-[#212529]">{money(subtotal)}</span>
                  </div>

                  {voucherDiscount > 0 && (
                    <div className="flex justify-between py-1 text-[#198754] font-medium">
                      <span>Diskon Voucher ({voucherCode})</span>
                      <span className="font-mono">− {money(voucherDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1">
                    <span className="text-[#6c757d]">Ongkir (Kurir Florist)</span>
                    <span className="font-mono text-[#212529]">{money(shippingFee)}</span>
                  </div>
                </div>

                <hr className="my-3 border-t border-[#e9ecef]" />

                <div className="flex justify-between items-center mb-5">
                  <span className="font-bold text-sm sm:text-base text-[#212529]">Total Pembayaran</span>
                  <strong className="text-lg sm:text-xl font-mono font-bold text-pink">
                    {money(grandTotal)}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 font-semibold text-sm text-white rounded-[10px] shadow-sm transition-all duration-180 !bg-pink hover:!bg-[#cf274c] disabled:opacity-60 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan & Bayar via Transfer'}
                </button>

                <p className="text-center text-[#6c757d] text-xs mt-3.5 mb-0 leading-relaxed">
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
