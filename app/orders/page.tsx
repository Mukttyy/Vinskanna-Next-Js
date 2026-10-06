'use client';

import { useState } from 'react';
import Link from 'next/link';
import { money } from '@/lib/store';
import { useOrdersState, OrderStatus } from '@/lib/orderStore';

type FilterTab = 'semua' | OrderStatus;

export default function OrdersPage() {
  const { orders, isLoaded } = useOrdersState();
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua Pesanan' },
    { key: 'belum_dibayar', label: 'Belum Dibayar' },
    { key: 'dikemas', label: 'Dikemas' },
    { key: 'dikirim', label: 'Dikirim' },
    { key: 'selesai', label: 'Selesai' }
  ];

  const filteredOrders =
    activeTab === 'semua' ? orders : orders.filter((o) => o.status === activeTab);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'belum_dibayar':
        return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">⏳ Belum Dibayar</span>;
      case 'dikemas':
        return <span className="badge bg-info text-white px-3 py-2 rounded-pill">🌸 Dikemas</span>;
      case 'dikirim':
        return <span className="badge bg-primary text-white px-3 py-2 rounded-pill">🚚 Dikirim</span>;
      case 'selesai':
        return <span className="badge bg-success text-white px-3 py-2 rounded-pill">✓ Selesai</span>;
    }
  };

  return (
    <main className="cart-page" style={{ minHeight: '80vh' }}>
      <div className="container py-2">
        <div className="title text-center mb-4">
          <h2 className="position-relative d-inline-block">Pesanan Saya</h2>
        </div>

        {/* Status Filter Tabs */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          {tabs.map((tab) => {
            const count =
              tab.key === 'semua'
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all ${
                  isActive ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'
                }`}
                style={{
                  backgroundColor: isActive ? '#e83e8c' : 'transparent',
                  borderColor: isActive ? '#e83e8c' : '#dee2e6'
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {!isLoaded ? (
          <div className="text-center py-5 text-muted">Memuat daftar pesanan...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-3 p-5 text-center my-4 bg-white">
            <div className="mb-3 fs-1">📦</div>
            <h3 className="h5 fw-bold mb-2">Belum Ada Pesanan</h3>
            <p className="text-muted mb-4" style={{ fontSize: 'var(--text-small)' }}>
              {activeTab === 'semua'
                ? 'Anda belum memiliki riwayat transaksi atau pesanan aktif.'
                : `Tidak ada pesanan dengan status "${tabs.find((t) => t.key === activeTab)?.label}".`}
            </p>
            <div>
              <Link href="/#collection" className="btn btn-primary text-white px-4 py-2">
                Mulai Belanja Bunga
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredOrders.map((order) => {
              const firstItem = order.items[0];
              const remainingCount = order.items.length - 1;

              return (
                <div key={order.id} className="col-12">
                  <div className="card border-0 shadow-sm rounded-3 p-4 bg-white transition-all">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3">
                      <div>
                        <strong className="fs-6 text-dark me-2 font-monospace">{order.id}</strong>
                        <span className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                          • {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="row align-items-center g-3">
                      {/* Product Preview */}
                      <div className="col-md-7 d-flex align-items-center gap-3">
                        {firstItem && (
                          <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            width={72}
                            height={84}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        )}
                        <div>
                          <h4 className="h6 mb-1">{firstItem?.name}</h4>
                          <div className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                            {firstItem?.quantity} barang × {money(firstItem?.price || 0)}
                          </div>
                          {remainingCount > 0 && (
                            <span className="badge bg-light text-secondary mt-1">
                              +{remainingCount} produk lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total & Action */}
                      <div className="col-md-5 d-flex flex-column flex-sm-row justify-content-md-end align-items-md-center gap-3">
                        <div className="text-md-end">
                          <div className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                            Total Pembayaran
                          </div>
                          <strong className="fs-5 text-primary font-monospace" style={{ color: '#e83e8c' }}>
                            {money(order.total)}
                          </strong>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="btn btn-outline-primary btn-sm px-3 py-2 fw-semibold"
                          style={{ borderRadius: '8px' }}
                        >
                          Lihat Detail & Status →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
