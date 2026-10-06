'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { allProducts } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const rawQuery = (searchParams.get('q') || '').trim().slice(0, 200);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const matchedProducts = rawQuery
    ? allProducts.filter((p) =>
        [p.name, ...p.tags].some((t) =>
          t.toLocaleLowerCase('id').includes(rawQuery.toLocaleLowerCase('id'))
        )
      )
    : [];

  const titleText = rawQuery
    ? `Hasil Pencarian: ${rawQuery}`
    : 'Pencarian Produk';

  return (
    <main id="search-results" className="cart-page" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="title text-center mb-4">
          <h2 id="search-title" className="position-relative d-inline-block">
            {titleText}
          </h2>
        </div>
        <div id="results-content" className="mt-4">
          {!rawQuery || matchedProducts.length === 0 ? (
            <div className="cart-empty">
              <h3>Produk tidak ditemukan</h3>
              <p>
                {rawQuery
                  ? `Tidak ada buket bunga yang cocok dengan kata kunci "${rawQuery}". Coba kata kunci lain.`
                  : 'Silakan ketikkan nama bunga atau buket yang ingin dicari pada kolom pencarian.'}
              </p>
              <Link href="/#collection" className="btn">
                Jelajahi Koleksi
              </Link>
            </div>
          ) : (
            <div className="row g-0">
              {matchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="cart-page" style={{ minHeight: '80vh' }}>
          <div className="container text-center py-5">
            <p className="text-muted">Memuat hasil pencarian...</p>
          </div>
        </main>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
