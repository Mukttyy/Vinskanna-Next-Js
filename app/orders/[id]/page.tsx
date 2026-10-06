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
      <main className="cart-page" style={{ minHeight: '60vh' }}>
        <div className="container py-5 text-center">
          <p className="text-muted">Memuat detail pesanan...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="cart-page" style={{ minHeight: '60vh' }}>
        <div className="container py-5 text-center">
          <div className="title mb-4">
            <h2 className="position-relative d-inline-block">Pesanan Tidak Ditemukan</h2>
          </div>
          <p className="text-muted">Pesanan dengan nomor ID {orderId} tidak ditemukan.</p>
          <div className="mt-4">
            <Link href="/orders" className="btn btn-primary text-white">
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
    <main className="cart-page" style={{ minHeight: '80vh' }}>
      <div className="container py-2">
        {/* Navigasi Kembali */}
        <div className="mb-4">
          <Link href="/orders" className="btn-back-nav">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Daftar Pesanan</span>
          </Link>
        </div>

        {/* Header Judul & Status */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Pesanan {order.id}</h1>
            <div className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
              Dibuat pada {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </div>
          </div>

          <span
            className={`badge px-3 py-2 fs-6 rounded-pill ${
              order.status === 'belum_dibayar'
                ? 'bg-warning text-dark'
                : order.status === 'dikemas'
                ? 'bg-info text-white'
                : order.status === 'dikirim'
                ? 'bg-primary text-white'
                : 'bg-success text-white'
            }`}
          >
            {order.status === 'belum_dibayar' && '⏳ Belum Dibayar'}
            {order.status === 'dikemas' && '🌸 Sedang Dikemas'}
            {order.status === 'dikirim' && '🚚 Sedang Dikirim'}
            {order.status === 'selesai' && '✓ Selesai'}
          </span>
        </div>

        {/* 1. VISUAL STEPPER */}
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#ffffff' }}>
          <div className="order-stepper position-relative">
            <div className="row text-center g-3">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={st.key} className="col-3 position-relative">
                    <div
                      className={`stepper-circle mx-auto d-flex align-items-center justify-content-center rounded-circle fw-bold ${
                        isPassed ? 'bg-primary text-white' : 'bg-light text-muted'
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
                    <div className="fw-semibold mt-2" style={{ fontSize: 'var(--text-small)' }}>
                      {st.label}
                    </div>
                    <div className="text-muted d-none d-md-block" style={{ fontSize: 'var(--text-caption)' }}>
                      {st.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Kolom Kiri: Instruksi Pembayaran, Bukti, & Detail Pengiriman */}
          <div className="col-lg-7">
            {/* Status Alert Banner */}
            {order.status === 'belum_dibayar' && (
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#fff9ea', borderLeft: '5px solid #f59e0b' }}>
                <h3 className="h6 fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Menunggu Pembayaran Transfer Bank
                </h3>
                <p className="mb-3 text-muted" style={{ fontSize: 'var(--text-small)' }}>
                  Silakan lakukan transfer sesuai total tagihan ke rekening bank resmi di bawah ini. Setelah transfer, unggah foto bukti pembayaran agar diaudit oleh florist.
                </p>

                <div className="card border p-3 mb-3" style={{ background: '#ffffff', borderRadius: '10px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-dark fw-bold">{order.bank.bankName}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      style={{ fontSize: 'var(--text-caption)' }}
                      onClick={() => copyToClipboard(order.bank.accountNumber, 'Nomor rekening')}
                    >
                      Salin Rekening
                    </button>
                  </div>
                  <div className="fs-5 fw-bold font-monospace text-dark">{order.bank.accountNumber}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>a/n {order.bank.accountHolder}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: '#f8f9fa' }}>
                  <span style={{ fontSize: 'var(--text-small)' }}>Jumlah yang Harus Ditransfer:</span>
                  <div className="d-flex align-items-center gap-2">
                    <strong className="fs-5 text-primary font-monospace fw-bold" style={{ color: '#e83e8c' }}>
                      {money(order.total)}
                    </strong>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      style={{ fontSize: 'var(--text-caption)' }}
                      onClick={() => copyToClipboard(String(order.total), 'Jumlah transfer')}
                    >
                      Salin
                    </button>
                  </div>
                </div>

                {/* Form Upload Bukti Transfer */}
                <div className="mt-4 pt-3 border-top">
                  <h4 className="h6 fw-bold mb-2">Unggah Bukti Transfer</h4>
                  <p className="text-muted mb-2" style={{ fontSize: 'var(--text-caption)' }}>
                    Foto struk ATM, tangkapan layar m-Banking / Internet Banking.
                  </p>

                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                  </div>

                  {(proofPreview || order.paymentProofUrl) && (
                    <div className="mb-3 p-2 border rounded bg-white text-center">
                      <p className="text-muted mb-1" style={{ fontSize: 'var(--text-caption)' }}>
                        Preview Bukti Transfer:
                      </p>
                      <img
                        src={proofPreview || order.paymentProofUrl}
                        alt="Bukti Transfer"
                        style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    </div>
                  )}

                  {proofPreview && (
                    <button
                      type="button"
                      className="btn btn-primary text-white w-100 py-2 fw-medium"
                      onClick={handleSaveProof}
                      disabled={isUploadingProof}
                    >
                      {isUploadingProof ? 'Menyimpan...' : 'Kirim Bukti Pembayaran'}
                    </button>
                  )}

                  {order.paymentProofUrl && !proofPreview && (
                    <div className="alert alert-info py-2 px-3 mt-2 mb-0" style={{ fontSize: 'var(--text-caption)' }}>
                      ✓ Bukti transfer telah tersimpan ({new Date(order.paymentProofUploadedAt || '').toLocaleTimeString('id-ID')}). Menunggu verifikasi toko.
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.status === 'dikemas' && (
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#f0fdf4', borderLeft: '5px solid #16a34a' }}>
                <h3 className="h6 fw-bold text-success d-flex align-items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Pembayaran Terverifikasi — Pesanan Sedang Dikemas
                </h3>
                <p className="mb-0 text-muted" style={{ fontSize: 'var(--text-small)' }}>
                  Audit manual berhasil. Florist kami sedang memilih bunga terbaik dan merangkai pesanan Anda dengan cermat.
                </p>
              </div>
            )}

            {order.status === 'dikirim' && (
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#eff6ff', borderLeft: '5px solid #0284c7' }}>
                <h3 className="h6 fw-bold text-primary d-flex align-items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  Pesanan Sedang Dalam Pengiriman
                </h3>
                <p className="text-muted mb-2" style={{ fontSize: 'var(--text-small)' }}>
                  Kurir sedang mengantarkan buket bunga ke alamat penerima.
                </p>
                <div className="p-2 rounded bg-white border mb-3" style={{ fontSize: 'var(--text-small)' }}>
                  <strong>Nomor Resi / Kurir:</strong> <span className="font-monospace text-primary">{order.trackingNumber}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-success text-white fw-medium w-100 py-2"
                  onClick={handleBuyerComplete}
                >
                  ✓ Konfirmasi Pesanan Telah Diterima (Selesai)
                </button>
              </div>
            )}

            {order.status === 'selesai' && (
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#fdf2f8', borderLeft: '5px solid #db2777' }}>
                <h3 className="h6 fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Pesanan Selesai
                </h3>
                <p className="mb-0 text-muted" style={{ fontSize: 'var(--text-small)' }}>
                  Rangkaian bunga telah tiba. Terima kasih telah mempercayakan momen spesial Anda kepada Vinskanna!
                </p>
              </div>
            )}

            {/* DETAIL DATA PENGIRIMAN */}
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#ffffff' }}>
              <h3 className="h6 fw-bold mb-3 pb-2 border-bottom">Informasi Pengiriman</h3>
              <div className="row g-2" style={{ fontSize: 'var(--text-small)' }}>
                <div className="col-sm-4 text-muted">Nama Penerima:</div>
                <div className="col-sm-8 fw-medium">{order.customer.fullName}</div>

                <div className="col-sm-4 text-muted">No. Telepon / WA:</div>
                <div className="col-sm-8 fw-medium">{order.customer.phone}</div>

                <div className="col-sm-4 text-muted">Kota / Daerah:</div>
                <div className="col-sm-8 fw-medium">{order.customer.city} {order.customer.postalCode ? `(${order.customer.postalCode})` : ''}</div>

                <div className="col-sm-4 text-muted">Alamat Lengkap:</div>
                <div className="col-sm-8">{order.customer.address}</div>

                {order.customer.notes && (
                  <>
                    <div className="col-sm-4 text-muted">Catatan Khusus:</div>
                    <div className="col-sm-8 fst-italic text-secondary">{order.customer.notes}</div>
                  </>
                )}
              </div>
            </div>

            {/* 2. PANEL AUDIT MANUAL (ADMIN / TOKO SIMULASI) */}
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="h6 fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Panel Audit Manual (Toko Florist)
                </h3>
                <span className="badge bg-secondary" style={{ fontSize: 'var(--text-caption)' }}>Simulasi Toko</span>
              </div>
              <p className="text-muted mb-3" style={{ fontSize: 'var(--text-caption)' }}>
                Fitur audit manual untuk memverifikasi transfer bank, mengemas buket, dan memperbarui status pesanan secara real-time.
              </p>

              <div className="d-flex flex-wrap gap-2">
                {order.status === 'belum_dibayar' && (
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm fw-medium"
                    onClick={handleAuditPayment}
                  >
                    ✓ Audit & Verifikasi Transfer (Ubah ke Dikemas)
                  </button>
                )}

                {order.status === 'dikemas' && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm fw-medium"
                    onClick={handleShipOrder}
                  >
                    🚚 Kirim Pesanan (Input Resi Kurir)
                  </button>
                )}

                {order.status === 'dikirim' && (
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm fw-medium"
                    onClick={handleBuyerComplete}
                  >
                    ✓ Tandai Pesanan Selesai
                  </button>
                )}

                {order.status === 'selesai' && (
                  <span className="text-success fw-medium" style={{ fontSize: 'var(--text-caption)' }}>
                    Pesanan telah diaudit dan selesai seluruhnya.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Produk & FITUR ULASAN */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4" style={{ background: '#ffffff' }}>
              <h3 className="h6 fw-bold mb-3 pb-2 border-bottom">Daftar Produk Pesanan</h3>

              <div className="order-items-list mb-3">
                {order.items.map((item) => {
                  const existingReview = order.reviews?.[item.id];
                  const reviewForm = reviewForms[item.id] || {
                    rating: existingReview?.rating || 5,
                    comment: existingReview?.comment || '',
                    isOpen: false
                  };

                  return (
                    <div key={item.id} className="py-3 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={70}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div className="flex-grow-1">
                          <h4 className="h6 mb-1 text-truncate" style={{ maxWidth: '200px' }}>
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

                      {/* FITUR ULASAN PRODUK (Hanya muncul jika status selesai) */}
                      {order.status === 'selesai' && (
                        <div className="mt-3 pt-2 border-top">
                          {existingReview && !reviewForm.isOpen ? (
                            <div className="p-3 rounded-3" style={{ background: '#fdf5f6', border: '1px solid #f8d7dc' }}>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <div className="text-warning d-flex align-items-center gap-1">
                                  <span style={{ fontSize: '1.05rem', letterSpacing: '2px' }}>
                                    {'★'.repeat(existingReview.rating)}
                                  </span>
                                  <span className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                                    {'☆'.repeat(5 - existingReview.rating)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-edit-review"
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
                              <p className="mb-0 text-dark fst-italic" style={{ fontSize: 'var(--text-small)' }}>
                                "{existingReview.comment}"
                              </p>
                            </div>
                          ) : (
                            <div>
                              {!reviewForm.isOpen && !existingReview && (
                                <button
                                  type="button"
                                  className="btn-review-prompt"
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
                                <div className="p-3 rounded border bg-light mt-2">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-bold" style={{ fontSize: 'var(--text-caption)' }}>
                                      Beri Rating:
                                    </span>
                                    <div className="rating-stars fs-5 cursor-pointer">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`cursor-pointer ${
                                            star <= reviewForm.rating ? 'text-warning' : 'text-muted'
                                          }`}
                                          style={{ cursor: 'pointer' }}
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
                                    className="form-control mb-2"
                                    placeholder="Tuliskan ulasan kualitas bunga, kesegaran, dan rangkaian..."
                                    style={{ fontSize: 'var(--text-caption)' }}
                                    value={reviewForm.comment}
                                    onChange={(e) =>
                                      setReviewForms((prev) => ({
                                        ...prev,
                                        [item.id]: { ...reviewForm, comment: e.target.value }
                                      }))
                                    }
                                  />

                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn-review-cancel"
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
                                      className="btn-review-submit"
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
              <div className="d-flex justify-content-between py-1" style={{ fontSize: 'var(--text-small)' }}>
                <span className="text-muted">Subtotal</span>
                <span className="font-monospace">{money(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="d-flex justify-content-between py-1 text-success" style={{ fontSize: 'var(--text-small)' }}>
                  <span>Diskon Voucher</span>
                  <span className="font-monospace">− {money(order.discount)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between py-1" style={{ fontSize: 'var(--text-small)' }}>
                <span className="text-muted">Ongkos Kirim</span>
                <span className="font-monospace">{money(order.shippingFee)}</span>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="fw-bold">Total Tagihan</span>
                <strong className="fs-5 text-primary font-monospace fw-bold" style={{ color: '#e83e8c' }}>
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
