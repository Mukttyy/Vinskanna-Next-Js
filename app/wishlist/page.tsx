'use client';

import { useStoreState } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, isLoaded } = useStoreState();

  return (
    <section id="wishlist" className="py-5" style={{ marginTop: '100px' }}>
      <div className="container">
        <div className="title text-center">
          <h2 className="position-relative d-inline-block">Your Wishlist</h2>
        </div>

        <div id="wishlist-content" className="row g-0 mt-5">
          {!isLoaded ? (
            <p className="text-center text-muted">Memuat wishlist...</p>
          ) : wishlist.length === 0 ? (
            <p className="text-center text-muted">Tidak ada produk untuk ditampilkan.</p>
          ) : (
            wishlist.map((product) => (
              <ProductCard key={product.id} product={product} isWishlistPage />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
