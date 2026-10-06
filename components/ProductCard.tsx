'use client';

import { Product } from '@/data/products';
import { money, useStoreState } from '@/lib/store';
import { notify } from '@/components/StatusToast';

interface ProductCardProps {
  product: Product;
  isWishlistPage?: boolean;
}

export function ProductCard({ product, isWishlistPage = false }: ProductCardProps) {
  const { wishlist, addToCart, toggleWishlist, moveToCart } = useStoreState();
  const isWishlisted = wishlist.some((p) => p.id === product.id);

  const handleAddToCart = () => {
    if (isWishlistPage) {
      const res = moveToCart(product.id);
      notify(res.message);
    } else {
      const res = addToCart(product.id);
      notify(res.message);
    }
  };

  const handleToggleWishlist = () => {
    const res = toggleWishlist(product.id);
    notify(res.message);
  };

  const wishlistLabel = isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist';

  return (
    <div className={`col-md-6 col-lg-4 col-xl-3 p-2 product-card ${product.category}`}>
      <div className="product-image-frame">
        <img
          src={product.image}
          alt={product.name}
          className="w-100 product-image"
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <p className="text-capitalize mt-3 mb-1">{product.name}</p>
        <span className="fw-bold d-block">{money(product.price)}</span>
        <div className="product-actions">
          <button
            type="button"
            className="btn btn-primary add-to-cart"
            onClick={handleAddToCart}
          >
            <svg
              className="product-action-icon"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Add to Cart</span>
          </button>
          <button
            type="button"
            className="btn wishlist-toggle"
            data-id={product.id}
            aria-label={wishlistLabel}
            title={wishlistLabel}
            aria-pressed={isWishlisted}
            onClick={handleToggleWishlist}
          >
            <svg
              className="product-action-icon"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
