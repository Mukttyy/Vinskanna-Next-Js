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
    <main className="cart-page" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="title text-center mb-4">
          <h2 className="position-relative d-inline-block">Wishlist Saya</h2>
        </div>

        <div id="wishlist-content" className="mt-4">
          {!isLoaded ? (
            <div className="text-center py-5 text-muted">Memuat wishlist...</div>
          ) : wishlist.length === 0 ? (
            <div className="cart-empty">
              <h3>Wishlist Anda masih kosong</h3>
              <p>Simpan buket bunga impian Anda untuk dilihat atau dibeli nanti.</p>
              <Link href="/#collection" className="btn">
                Jelajahi Koleksi
              </Link>
            </div>
          ) : (
            <div className="row g-0">
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
