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
    <main id="search-results" className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-page min-h-[80vh]">
      <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="title text-center mb-4">
          <h2 id="search-title" className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
            {titleText}
          </h2>
        </div>
        <div id="results-content" className="mt-6">
          {!rawQuery || matchedProducts.length === 0 ? (
            <div className="cart-empty bg-white border border-[#ece6e8] rounded-card py-12 px-6 text-center">
              <h3 className="text-[1.25rem] font-medium leading-[1.25] text-[#212529] mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-base font-normal leading-[1.65] text-[#212529] mb-4">
                {rawQuery
                  ? `Tidak ada buket bunga yang cocok dengan kata kunci "${rawQuery}". Coba kata kunci lain.`
                  : 'Silakan ketikkan nama bunga atau buket yang ingin dicari pada kolom pencarian.'}
              </p>
              <Link
                href="/#collection"
                className="btn inline-block bg-white text-[#555555] py-[10px] px-7 rounded-pill border border-[#555555] text-base font-medium leading-normal hover:bg-pink hover:text-white hover:border-pink transition-colors duration-180"
              >
                Jelajahi Koleksi
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap w-full">
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
        <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-page min-h-[80vh]">
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px] text-center py-12">
            <p className="text-[#6c757d]">Memuat hasil pencarian...</p>
          </div>
        </main>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
