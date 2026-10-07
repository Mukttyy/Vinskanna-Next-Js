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
        return <span className="inline-flex items-center px-3 py-1.5 rounded-pill text-xs font-semibold bg-[#ffc107] text-[#212529]">⏳ Belum Dibayar</span>;
      case 'dikemas':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-pill text-xs font-semibold bg-[#0dcaf0] text-white">🌸 Dikemas</span>;
      case 'dikirim':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-pill text-xs font-semibold bg-[#0d6efd] text-white">🚚 Dikirim</span>;
      case 'selesai':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-pill text-xs font-semibold bg-[#198754] text-white">✓ Selesai</span>;
    }
  };

  return (
    <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-page min-h-[80vh]">
      <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="title text-center mb-4">
          <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
            Pesanan Saya
          </h2>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
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
                className={`btn inline-flex items-center text-sm px-3.5 py-1.5 rounded-pill font-medium transition-all ${
                  isActive
                    ? '!bg-pink !text-white !border-pink shadow-sm'
                    : '!bg-transparent !text-[#6c757d] hover:!text-[#212529] !border-[#dee2e6] hover:!bg-[#f8f9fa]'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {!isLoaded ? (
          <div className="text-center py-12 text-[#6c757d]">Memuat daftar pesanan...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#ece6e8] rounded-card shadow-sm p-8 sm:p-12 text-center my-4">
            <div className="mb-3 text-4xl">📦</div>
            <h3 className="text-lg font-bold text-[#212529] mb-2">Belum Ada Pesanan</h3>
            <p className="text-[#6c757d] text-sm mb-6 max-w-md mx-auto">
              {activeTab === 'semua'
                ? 'Anda belum memiliki riwayat transaksi atau pesanan aktif.'
                : `Tidak ada pesanan dengan status "${tabs.find((t) => t.key === activeTab)?.label}".`}
            </p>
            <div>
              <Link href="/#collection" className="btn inline-block !bg-pink hover:!bg-pink-hover !text-white px-6 py-2.5 rounded-pill text-sm font-medium !border-pink transition-colors">
                Mulai Belanja Bunga
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              const firstItem = order.items[0];
              const remainingCount = order.items.length - 1;

              return (
                <div key={order.id} className="w-full">
                  <div className="bg-white border border-[#ece6e8] rounded-card shadow-sm p-4 sm:p-6 transition-shadow hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ece6e8] mb-4">
                      <div>
                        <strong className="text-sm sm:text-base text-[#212529] font-mono mr-2">{order.id}</strong>
                        <span className="text-[#767078] text-xs sm:text-sm">
                          • {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Preview */}
                      <div className="md:col-span-7 flex items-center gap-3.5 min-w-0">
                        {firstItem && (
                          <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            width={72}
                            height={84}
                            className="w-[72px] h-[84px] object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold text-[#212529] mb-1">{firstItem?.name}</h4>
                          <div className="text-[#767078] text-xs sm:text-sm">
                            {firstItem?.quantity} barang × {money(firstItem?.price || 0)}
                          </div>
                          {remainingCount > 0 && (
                            <span className="inline-block bg-[#f8f9fa] text-[#6c757d] text-xs px-2 py-0.5 rounded mt-1.5">
                              +{remainingCount} produk lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total & Action */}
                      <div className="md:col-span-5 flex flex-col sm:flex-row md:justify-end items-start sm:items-center gap-3">
                        <div className="text-left md:text-right">
                          <div className="text-[#767078] text-xs mb-0.5">
                            Total Pembayaran
                          </div>
                          <strong className="text-base sm:text-lg text-pink font-semibold tabular-nums">
                            {money(order.total)}
                          </strong>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="btn inline-flex items-center justify-center !text-pink hover:!bg-pink hover:!text-white !border-pink !bg-transparent text-xs sm:text-sm font-semibold px-4 py-2 !rounded-lg transition-colors duration-180"
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
