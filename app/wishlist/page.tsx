'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useStoreState } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, isLoaded } = useStoreState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="cart-page mt-[var(--navbar-height,100px)] pt-8 pb-10 sm:pt-12 sm:pb-16 bg-page min-h-[80vh]">
      <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="title text-center mb-4">
          <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
            Wishlist Saya
          </h2>
        </div>

        <div id="wishlist-content" className="mt-6">
          {!isLoaded ? (
            <div className="text-center py-12 text-[#6c757d]">Memuat wishlist...</div>
          ) : wishlist.length === 0 ? (
            <div className="cart-empty bg-white border border-[#ece6e8] rounded-card py-12 px-6 text-center">
              <h3 className="text-[1.25rem] font-medium leading-[1.25] text-[#212529] mb-2">
                Wishlist Anda masih kosong
              </h3>
              <p className="text-base font-normal leading-[1.65] text-[#212529] mb-4">
                Simpan buket bunga impian Anda untuk dilihat atau dibeli nanti.
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
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} isWishlistPage />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
