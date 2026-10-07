'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { money } from '@/lib/store';
import {
  getOrderById,
  uploadPaymentProof,
  auditConfirmPayment,
  shipOrder,
  completeOrder,
  addProductReview,
  Order,
  OrderStatus
} from '@/lib/orderStore';
import { notify } from '@/components/StatusToast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Transfer Proof Upload state
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Review states: productId -> { rating, comment, isEditing }
  const [reviewForms, setReviewForms] = useState<
    Record<string, { rating: number; comment: string; isOpen: boolean }>
  >({});

  const reloadOrder = () => {
    const found = getOrderById(orderId);
    if (found) {
      setOrder(found);
    }
  };

  useEffect(() => {
    reloadOrder();
    setIsLoaded(true);

    const onStorage = () => reloadOrder();
    window.addEventListener('storage', onStorage);
    window.addEventListener('vinskanna:orders-updated', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('vinskanna:orders-updated', onStorage);
    };
  }, [orderId]);

  if (!isLoaded) {
    return (
      <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-[#faf8f9] min-h-[60vh]">
        <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px] py-12 text-center">
          <p className="text-[#6c757d] text-sm">Memuat detail pesanan...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-[#faf8f9] min-h-[60vh]">
        <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px] py-12 text-center">
          <div className="title text-center mb-4">
            <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
              Pesanan Tidak Ditemukan
            </h2>
          </div>
          <p className="text-[#6c757d] text-sm">Pesanan dengan nomor ID {orderId} tidak ditemukan.</p>
          <div className="mt-6">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center font-medium transition-all rounded-[25px] !bg-pink hover:!bg-[#cf274c] !text-white !border !border-pink px-6 py-2.5 text-sm"
            >
              Lihat Semua Pesanan
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Handle proof image file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Harap pilih file gambar (JPG, PNG, atau WEBP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProof = () => {
    if (!proofPreview) {
      notify('Pilih gambar bukti transfer terlebih dahulu.', 'warning');
      return;
    }
    setIsUploadingProof(true);
    const ok = uploadPaymentProof(order.id, proofPreview);
    setIsUploadingProof(false);
    if (ok) {
      notify('Bukti transfer berhasil diunggah! Menunggu audit toko.', 'success');
      reloadOrder();
    } else {
      notify('Gagal menyimpan bukti transfer.', 'error');
    }
  };

  // Store manual audit actions
  const handleAuditPayment = () => {
    const ok = auditConfirmPayment(order.id);
    if (ok) {
      notify('Pembayaran terverifikasi melalui audit manual! Status: Dikemas.', 'success');
      reloadOrder();
    }
  };

  const handleShipOrder = () => {
    const resi = prompt('Masukkan nomor resi pengiriman:', `VIN-EXP-${Math.floor(100000 + Math.random() * 900000)}`);
    if (resi) {
      const ok = shipOrder(order.id, resi.trim());
      if (ok) {
        notify('Pesanan berhasil dikirim ke pembeli! Status: Dikirim.', 'success');
        reloadOrder();
      }
    }
  };

  const handleBuyerComplete = () => {
    const confirmed = confirm('Konfirmasi bahwa pesanan rangkaian bunga telah sampai dengan baik?');
    if (confirmed) {
      const ok = completeOrder(order.id);
      if (ok) {
        notify('Pesanan telah selesai! Jangan lupa berikan ulasan Anda.', 'success');
        reloadOrder();
      }
    }
  };

  // Review handler
  const handleReviewSubmit = (productId: string) => {
    const form = reviewForms[productId];
    if (!form || form.rating === 0) {
      notify('Berikan bintang rating 1–5 sebelum mengirim ulasan.', 'warning');
      return;
    }
    if (!form.comment.trim()) {
      notify('Tuliskan komentar pengalaman Anda.', 'warning');
      return;
    }

    const ok = addProductReview(order.id, productId, {
      rating: form.rating,
      comment: form.comment.trim()
    });

    if (ok) {
      notify('Ulasan Anda berhasil dikirim! Terima kasih.', 'success');
      setReviewForms((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], isOpen: false }
      }));
      reloadOrder();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      notify(`${label} berhasil disalin!`, 'info');
    }
  };

  // Status Stepper calculation
  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'belum_dibayar', label: 'Belum Dibayar', desc: 'Menunggu transfer pembeli' },
    { key: 'dikemas', label: 'Dikemas', desc: 'Dirangkai & dikemas florist' },
    { key: 'dikirim', label: 'Dikirim', desc: 'Dalam perjalanan kurir' },
    { key: 'selesai', label: 'Selesai', desc: 'Pesanan tiba & ulasan' }
  ];

  const getStepIndex = (s: OrderStatus) => {
    switch (s) {
      case 'belum_dibayar':
        return 0;
      case 'dikemas':
        return 1;
      case 'dikirim':
        return 2;
      case 'selesai':
        return 3;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <main className="cart-page mt-[var(--navbar-height,100px)] pt-6 pb-12 sm:pt-8 sm:pb-16 bg-[#faf8f9] min-h-[80vh]">
      <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        {/* Header Judul, Navigasi Kembali, & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <Link
              href="/orders"
              className="btn-back-circle mt-1"
              title="Kembali ke Daftar Pesanan"
              aria-label="Kembali ke Daftar Pesanan"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#212529] mb-1">
                Pesanan {order.id}
              </h1>
              <div className="text-[#6c757d] text-xs">
                Dibuat pada {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full shadow-xs ${
              order.status === 'belum_dibayar'
                ? 'bg-[#ffc107] text-[#212529]'
                : order.status === 'dikemas'
                ? 'bg-[#0dcaf0] text-white'
                : order.status === 'dikirim'
                ? 'bg-pink text-white'
                : 'bg-[#198754] text-white'
            }`}
          >
            {order.status === 'belum_dibayar' && '⏳ Belum Dibayar'}
            {order.status === 'dikemas' && '🌸 Sedang Dikemas'}
            {order.status === 'dikirim' && '🚚 Sedang Dikirim'}
            {order.status === 'selesai' && '✓ Selesai'}
          </span>
        </div>

        {/* 1. VISUAL STEPPER */}
        <div className="bg-white rounded-xl shadow-sm border border-[#ece6e8]/60 p-4 sm:p-6 mb-6">
          <div className="order-stepper relative">
            <div className="grid grid-cols-4 text-center gap-2 sm:gap-4">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={st.key} className="relative">
                    <div
                      className={`stepper-circle mx-auto flex items-center justify-center rounded-full font-bold relative z-10 ${
                        isPassed ? 'text-white' : 'text-[#6c757d]'
                      }`}
                      style={{
                        width: '42px',
                        height: '42px',
                        fontSize: '1rem',
                        border: isCurrent ? '3px solid #fea1ac' : '2px solid transparent',
                        backgroundColor: isPassed ? '#e83e8c' : '#e9ecef',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="font-semibold text-xs sm:text-sm mt-2 text-[#212529]">
                      {st.label}
                    </div>
                    <div className="text-[#6c757d] text-xs hidden md:block mt-0.5">
                      {st.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Instruksi Pembayaran, Bukti, & Detail Pengiriman */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Status Alert Banner */}
            {order.status === 'belum_dibayar' && (
              <div
                className="bg-[#fff9ea] rounded-xl shadow-sm p-4 sm:p-6 border border-[#ece6e8]/40 border-l-[5px] border-l-[#f59e0b]"
              >
                <h3 className="text-sm sm:text-base font-bold text-[#212529] flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#f59e0b] shrink-0">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Menunggu Pembayaran Transfer Bank
                </h3>
                <p className="mb-4 text-[#6c757d] text-xs sm:text-sm leading-relaxed">
                  Silakan lakukan transfer sesuai total tagihan ke rekening bank resmi di bawah ini. Setelah transfer, unggah foto bukti pembayaran agar diaudit oleh florist.
                </p>

                <div className="bg-white border border-[#dee2e6] rounded-[10px] p-3 sm:p-4 mb-3 shadow-2xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#212529] text-white">
                      {order.bank.bankName}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center text-xs py-0.5 px-2.5 rounded border border-[#6c757d] text-[#6c757d] hover:bg-[#6c757d] hover:text-white transition-colors duration-150 cursor-pointer"
                      onClick={() => copyToClipboard(order.bank.accountNumber, 'Nomor rekening')}
                    >
                      Salin Rekening
                    </button>
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#212529] tracking-wider my-0.5">
                    {order.bank.accountNumber}
                  </div>
                  <div className="text-[#6c757d] text-xs">
                    a/n {order.bank.accountHolder}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 sm:p-3.5 rounded-lg bg-[#f8f9fa] border border-[#e9ecef]">
                  <span className="text-xs sm:text-sm text-[#212529]">Jumlah yang Harus Ditransfer:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-lg sm:text-xl font-mono font-bold text-pink">
                      {money(order.total)}
                    </strong>
                    <button
                      type="button"
                      className="inline-flex items-center text-xs py-0.5 px-2 rounded border border-[#6c757d] text-[#6c757d] hover:bg-[#6c757d] hover:text-white transition-colors duration-150 cursor-pointer"
                      onClick={() => copyToClipboard(String(order.total), 'Jumlah transfer')}
                    >
                      Salin
                    </button>
                  </div>
                </div>

                {/* Form Upload Bukti Transfer */}
                <div className="mt-5 pt-4 border-t border-[#e9ecef]">
                  <h4 className="text-sm sm:text-base font-bold text-[#212529] mb-1">
                    Unggah Bukti Transfer
                  </h4>
                  <p className="text-[#6c757d] text-xs mb-3">
                    Foto struk ATM, tangkapan layar m-Banking / Internet Banking.
                  </p>

                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-xs sm:text-sm text-[#495057] border border-[#ced4da] rounded-lg cursor-pointer bg-white focus:outline-none focus:border-pink file:mr-3 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-xs file:font-medium file:bg-[#f8f9fa] file:text-[#495057] hover:file:bg-[#e9ecef] transition-all"
                      onChange={handleFileChange}
                    />
                  </div>

                  {(proofPreview || order.paymentProofUrl) && (
                    <div className="mb-3 p-3 border border-[#dee2e6] rounded-lg bg-white text-center">
                      <p className="text-[#6c757d] text-xs mb-2">
                        Preview Bukti Transfer:
                      </p>
                      <img
                        src={proofPreview || order.paymentProofUrl}
                        alt="Bukti Transfer"
                        className="max-h-[200px] max-w-full mx-auto object-contain rounded-md"
                      />
                    </div>
                  )}

                  {proofPreview && (
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-[25px] font-medium text-sm text-white !bg-pink hover:!bg-[#cf274c] transition-all duration-180 shadow-xs disabled:opacity-60 cursor-pointer"
                      onClick={handleSaveProof}
                      disabled={isUploadingProof}
                    >
                      {isUploadingProof ? 'Menyimpan...' : 'Kirim Bukti Pembayaran'}
                    </button>
                  )}

                  {order.paymentProofUrl && !proofPreview && (
                    <div className="mt-3 p-2.5 rounded-lg bg-[#cff4fc] border border-[#b6effb] text-[#055160] text-xs font-medium">
                      ✓ Bukti transfer telah tersimpan ({new Date(order.paymentProofUploadedAt || '').toLocaleTimeString('id-ID')}). Menunggu verifikasi toko.
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.status === 'dikemas' && (
              <div
                className="bg-[#f0fdf4] rounded-xl shadow-sm p-4 sm:p-6 border border-[#ece6e8]/40 border-l-[5px] border-l-[#16a34a]"
              >
                <h3 className="text-sm sm:text-base font-bold text-[#16a34a] flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Pembayaran Terverifikasi — Pesanan Sedang Dikemas
                </h3>
                <p className="mb-0 text-[#6c757d] text-xs sm:text-sm leading-relaxed">
                  Audit manual berhasil. Florist kami sedang memilih bunga terbaik dan merangkai pesanan Anda dengan cermat.
                </p>
              </div>
            )}

            {order.status === 'dikirim' && (
              <div
                className="bg-[#eff6ff] rounded-xl shadow-sm p-4 sm:p-6 border border-[#ece6e8]/40 border-l-[5px] border-l-[#0284c7]"
              >
                <h3 className="text-sm sm:text-base font-bold text-pink flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  Pesanan Sedang Dalam Pengiriman
                </h3>
                <p className="text-[#6c757d] text-xs sm:text-sm mb-3">
                  Kurir sedang mengantarkan buket bunga ke alamat penerima.
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-[#dee2e6] mb-4 text-xs sm:text-sm">
                  <strong className="text-[#212529]">Nomor Resi / Kurir:</strong>{' '}
                  <span className="font-mono text-pink font-semibold">{order.trackingNumber}</span>
                </div>
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-[25px] font-medium text-sm text-white bg-[#198754] hover:bg-[#157347] transition-all duration-180 shadow-xs cursor-pointer"
                  onClick={handleBuyerComplete}
                >
                  ✓ Konfirmasi Pesanan Telah Diterima (Selesai)
                </button>
              </div>
            )}

            {order.status === 'selesai' && (
              <div
                className="bg-[#fdf2f8] rounded-xl shadow-sm p-4 sm:p-6 border border-[#ece6e8]/40 border-l-[5px] border-l-[#db2777]"
              >
                <h3 className="text-sm sm:text-base font-bold text-[#212529] flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Pesanan Selesai
                </h3>
                <p className="mb-0 text-[#6c757d] text-xs sm:text-sm leading-relaxed">
                  Rangkaian bunga telah tiba. Terima kasih telah mempercayakan momen spesial Anda kepada Vinskanna!
                </p>
              </div>
            )}

            {/* DETAIL DATA PENGIRIMAN */}
            <div className="bg-white rounded-xl shadow-sm border border-[#ece6e8]/60 p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-[#212529] pb-2.5 mb-3.5 border-b border-[#e9ecef]">
                Informasi Pengiriman
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-12 gap-y-2.5 gap-x-2 text-xs sm:text-sm">
                <dt className="sm:col-span-4 text-[#6c757d]">Nama Penerima:</dt>
                <dd className="sm:col-span-8 font-medium text-[#212529]">{order.customer.fullName}</dd>

                <dt className="sm:col-span-4 text-[#6c757d]">No. Telepon / WA:</dt>
                <dd className="sm:col-span-8 font-medium text-[#212529]">{order.customer.phone}</dd>

                <dt className="sm:col-span-4 text-[#6c757d]">Kota / Daerah:</dt>
                <dd className="sm:col-span-8 font-medium text-[#212529]">
                  {order.customer.city} {order.customer.postalCode ? `(${order.customer.postalCode})` : ''}
                </dd>

                <dt className="sm:col-span-4 text-[#6c757d]">Alamat Lengkap:</dt>
                <dd className="sm:col-span-8 text-[#212529]">{order.customer.address}</dd>

                {order.customer.notes && (
                  <>
                    <dt className="sm:col-span-4 text-[#6c757d]">Catatan Khusus:</dt>
                    <dd className="sm:col-span-8 italic text-[#6c757d]">{order.customer.notes}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* 2. PANEL AUDIT MANUAL (ADMIN / TOKO SIMULASI) */}
            <div className="bg-[#f8fafc] rounded-xl shadow-sm border border-dashed border-[#cbd5e1] p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-bold text-[#212529] flex items-center gap-2 mb-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#475569]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Panel Audit Manual (Toko Florist)
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#6c757d] text-white">
                  Simulasi Toko
                </span>
              </div>
              <p className="text-[#6c757d] text-xs mb-3 leading-relaxed">
                Fitur audit manual untuk memverifikasi transfer bank, mengemas buket, dan memperbarui status pesanan secara real-time.
              </p>

              <div className="flex flex-wrap gap-2">
                {order.status === 'belum_dibayar' && (
                  <button
                    type="button"
                    className="inline-flex items-center text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border border-[#198754] text-[#198754] hover:bg-[#198754] hover:text-white transition-all duration-150 cursor-pointer"
                    onClick={handleAuditPayment}
                  >
                    ✓ Audit & Verifikasi Transfer (Ubah ke Dikemas)
                  </button>
                )}

                {order.status === 'dikemas' && (
                  <button
                    type="button"
                    className="inline-flex items-center text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border border-pink text-pink hover:bg-pink hover:text-white transition-all duration-150 cursor-pointer"
                    onClick={handleShipOrder}
                  >
                    🚚 Kirim Pesanan (Input Resi Kurir)
                  </button>
                )}

                {order.status === 'dikirim' && (
                  <button
                    type="button"
                    className="inline-flex items-center text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border border-[#0dcaf0] text-[#0aa2c0] hover:bg-[#0dcaf0] hover:text-white transition-all duration-150 cursor-pointer"
                    onClick={handleBuyerComplete}
                  >
                    ✓ Tandai Pesanan Selesai
                  </button>
                )}

                {order.status === 'selesai' && (
                  <span className="text-[#198754] font-medium text-xs sm:text-sm">
                    Pesanan telah diaudit dan selesai seluruhnya.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Produk & FITUR ULASAN */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#ece6e8]/60 p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-[#212529] pb-2.5 mb-3 border-b border-[#e9ecef]">
                Daftar Produk Pesanan
              </h3>

              <div className="divide-y divide-[#e9ecef] mb-3">
                {order.items.map((item) => {
                  const existingReview = order.reviews?.[item.id];
                  const reviewForm = reviewForms[item.id] || {
                    rating: existingReview?.rating || 5,
                    comment: existingReview?.comment || '',
                    isOpen: false
                  };

                  return (
                    <div key={item.id} className="py-3.5 first:pt-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={70}
                          className="w-[60px] h-[70px] rounded-lg object-cover shrink-0 bg-[#f8f9fa]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#212529] truncate max-w-[180px] sm:max-w-none mb-1">
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

                      {/* FITUR ULASAN PRODUK (Hanya muncul jika status selesai) */}
                      {order.status === 'selesai' && (
                        <div className="mt-3 pt-2.5 border-t border-[#f1f3f5]">
                          {existingReview && !reviewForm.isOpen ? (
                            <div className="p-3 rounded-xl bg-[#fdf5f6] border border-[#f8d7dc]">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-[#ffc107] flex items-center gap-1">
                                  <span className="text-base tracking-[2px]">
                                    {'★'.repeat(existingReview.rating)}
                                  </span>
                                  <span className="text-[#adb5bd] text-xs">
                                    {'☆'.repeat(5 - existingReview.rating)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-edit-review inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-pink bg-white border border-pink rounded-full hover:bg-pink hover:text-white transition-all duration-180 cursor-pointer"
                                  onClick={() =>
                                    setReviewForms((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        rating: existingReview.rating,
                                        comment: existingReview.comment,
                                        isOpen: true
                                      }
                                    }))
                                  }
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                  </svg>
                                  Ubah Ulasan
                                </button>
                              </div>
                              <p className="mb-0 text-[#212529] italic text-xs sm:text-sm leading-relaxed">
                                "{existingReview.comment}"
                              </p>
                            </div>
                          ) : (
                            <div>
                              {!reviewForm.isOpen && !existingReview && (
                                <button
                                  type="button"
                                  className="btn-review-prompt w-full flex items-center justify-center py-2 px-4 text-xs sm:text-sm font-medium text-pink bg-white border border-pink rounded-full hover:bg-pink hover:text-white transition-all duration-180 cursor-pointer"
                                  onClick={() =>
                                    setReviewForms((prev) => ({
                                      ...prev,
                                      [item.id]: { rating: 5, comment: '', isOpen: true }
                                    }))
                                  }
                                >
                                  ★ Beri Ulasan Produk
                                </button>
                              )}

                              {reviewForm.isOpen && (
                                <div className="p-3 rounded-lg border border-[#dee2e6] bg-[#f8f9fa] mt-2">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-xs text-[#212529]">
                                      Beri Rating:
                                    </span>
                                    <div className="rating-stars flex gap-1 text-lg select-none">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`cursor-pointer transition-transform duration-150 hover:scale-125 ${
                                            star <= reviewForm.rating ? 'text-[#ffc107]' : 'text-[#ced4da]'
                                          }`}
                                          onClick={() =>
                                            setReviewForms((prev) => ({
                                              ...prev,
                                              [item.id]: { ...reviewForm, rating: star }
                                            }))
                                          }
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <textarea
                                    rows={2}
                                    className="w-full p-2.5 border border-[#ced4da] rounded-md text-xs sm:text-sm text-[#212529] bg-white focus:outline-none focus:border-pink mb-2 resize-none"
                                    placeholder="Tuliskan ulasan kualitas bunga, kesegaran, dan rangkaian..."
                                    value={reviewForm.comment}
                                    onChange={(e) =>
                                      setReviewForms((prev) => ({
                                        ...prev,
                                        [item.id]: { ...reviewForm, comment: e.target.value }
                                      }))
                                    }
                                  />

                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      className="btn-review-cancel py-1 px-3.5 text-xs font-medium text-[#6c757d] bg-white border border-[#dee2e6] rounded-full hover:bg-[#f8f9fa] hover:text-[#212529] transition-all duration-180 cursor-pointer"
                                      onClick={() =>
                                        setReviewForms((prev) => ({
                                          ...prev,
                                          [item.id]: { ...reviewForm, isOpen: false }
                                        }))
                                      }
                                    >
                                      Batal
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-review-submit py-1 px-4 text-xs font-medium text-white !bg-pink hover:!bg-[#cf274c] border border-pink rounded-full transition-all duration-180 cursor-pointer"
                                      onClick={() => handleReviewSubmit(item.id)}
                                    >
                                      Kirim Ulasan
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rincian Angka */}
              <div className="pt-2 border-t border-[#e9ecef] space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-[#6c757d]">Subtotal</span>
                  <span className="font-mono text-[#212529]">{money(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between py-1 text-[#198754] font-medium">
                    <span>Diskon Voucher</span>
                    <span className="font-mono">− {money(order.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1">
                  <span className="text-[#6c757d]">Ongkos Kirim</span>
                  <span className="font-mono text-[#212529]">{money(order.shippingFee)}</span>
                </div>
              </div>

              <hr className="my-3 border-t border-[#e9ecef]" />

              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-sm sm:text-base text-[#212529]">Total Tagihan</span>
                <strong className="text-lg sm:text-xl font-mono font-bold text-pink">
                  {money(order.total)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
