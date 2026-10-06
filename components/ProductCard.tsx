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
      notify(res.message, res.success ? 'success' : 'error');
    } else {
      const res = addToCart(product.id);
      notify(res.message, res.success ? 'success' : 'error');
    }
  };

  const handleToggleWishlist = () => {
    const res = toggleWishlist(product.id);
    notify(res.message, res.active ? 'success' : 'info');
  };

  const wishlistLabel = isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist';

  return (
    <div className={`col-md-6 col-lg-4 col-xl-3 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2 product-card group ${product.category}`}>
      <div className="product-image-frame overflow-hidden rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full product-image block transition-transform duration-300 group-hover:scale-[1.06] group-focus-within:scale-[1.06]"
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <p className="text-capitalize mt-4 mb-1 text-base leading-normal text-[#212529] font-normal">{product.name}</p>
        <span className="fw-bold d-block text-base font-semibold leading-normal text-[#212529] tabular-nums">{money(product.price)}</span>
        <div className="product-actions flex justify-center items-center gap-2 mt-4">
          <button
            type="button"
            className="btn btn-primary add-to-cart inline-flex items-center justify-center gap-2 min-h-[44px] py-[10px] px-4 whitespace-nowrap text-sm font-medium rounded-pill bg-pink hover:bg-pink-hover text-white border border-pink transition-colors duration-180"
            onClick={handleAddToCart}
          >
            <svg
              className="product-action-icon shrink-0"
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
            className={`btn wishlist-toggle w-[44px] h-[44px] shrink-0 p-2.5 rounded-full inline-flex items-center justify-center border border-[#c9254c] transition-colors duration-180 ${
              isWishlisted
                ? 'bg-[#ffdce5] text-[#c9254c]'
                : 'bg-[#fff1f4] text-[#c9254c] hover:bg-[#ffdce5]'
            }`}
            data-id={product.id}
            aria-label={wishlistLabel}
            title={wishlistLabel}
            aria-pressed={isWishlisted}
            onClick={handleToggleWishlist}
          >
            <svg
              className="product-action-icon shrink-0"
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
