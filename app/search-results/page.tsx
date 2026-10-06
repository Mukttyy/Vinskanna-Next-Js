'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { allProducts } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const rawQuery = (searchParams.get('q') || '').trim().slice(0, 200);

  const matchedProducts = rawQuery
    ? allProducts.filter((p) =>
        [p.name, ...p.tags].some((t) =>
          t.toLocaleLowerCase('id').includes(rawQuery.toLocaleLowerCase('id'))
        )
      )
    : [];

  const titleText = rawQuery
    ? `Hasil Pencarian untuk: ${rawQuery}`
    : 'Silakan masukkan kata kunci pencarian.';

  return (
    <section id="search-results" className="py-5" style={{ marginTop: '100px' }}>
      <div className="container">
        <div className="title text-center">
          <h2 id="search-title" className="position-relative d-inline-block">
            {titleText}
          </h2>
        </div>
        <div id="results-content" className="row g-0 mt-5">
          {!rawQuery || matchedProducts.length === 0 ? (
            <p className="text-center text-muted">Tidak ada produk untuk ditampilkan.</p>
          ) : (
            matchedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <section id="search-results" className="py-5" style={{ marginTop: '100px' }}>
        <div className="container text-center">
          <p className="text-muted">Memuat hasil pencarian...</p>
        </div>
      </section>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
