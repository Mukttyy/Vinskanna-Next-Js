'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useStoreState } from '@/lib/store';
import { useOrdersState } from '@/lib/orderStore';
import { storeConfig } from '@/data/config';

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalCartCount, totalWishlistCount, isLoaded } = useStoreState();
  const { orders } = useOrdersState();

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const sync = () => {
      document.documentElement.style.setProperty('--navbar-height', `${navbar.getBoundingClientRect().height}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/search-results?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white py-4 fixed-top">
      <div className="container">
        <Link className="navbar-brand d-flex justify-content-between align-items-center order-lg-0" href="/">
          <span aria-hidden="true">❀</span>
          <span className="text-uppercase fw-normal ms-2" data-store-name="">{storeConfig.name}</span>
        </Link>

        <div className="order-lg-2 nav-btns">
          <Link
            href="/orders"
            className="btn position-relative"
            aria-label="Pesanan Saya"
            title="Pesanan Saya"
            onClick={() => window.scrollTo(0, 0)}
          >
            <svg className="nav-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {isLoaded && orders.length > 0 && (
              <span data-orders-count="" className="badge bg-primary">
                {orders.length}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="btn position-relative"
            aria-label="Keranjang"
            title="Keranjang"
            onClick={() => window.scrollTo(0, 0)}
          >
            <svg className="nav-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span data-cart-count="" className="badge bg-primary">
              {isLoaded ? totalCartCount : 0}
            </span>
          </Link>
          <Link
            href="/wishlist"
            className="btn position-relative"
            aria-label="Wishlist"
            title="Wishlist"
            onClick={() => window.scrollTo(0, 0)}
          >
            <svg className="nav-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span data-wishlist-count="" className="badge bg-primary">
              {isLoaded ? totalWishlistCount : 0}
            </span>
          </Link>
        </div>

        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Buka navigasi"
          aria-controls="navMenu"
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse order-lg-1 ${isNavOpen ? 'show' : ''}`} id="navMenu">
          <ul className="navbar-nav mx-auto text-center">
            <li className="nav-item px-2 py-2 nav-home-search">
              <div className="nav-search" ref={searchContainerRef}>
                <button
                  type="button"
                  className="btn"
                  id="search-icon-btn"
                  aria-label="Cari"
                  title="Cari"
                  aria-expanded={isSearchOpen}
                  aria-controls="search-form"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <svg className="nav-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
                <form
                  id="search-form"
                  className="navbar-search"
                  action="/search-results"
                  method="GET"
                  hidden={!isSearchOpen}
                  onSubmit={handleSearchSubmit}
                >
                  <input
                    ref={searchInputRef}
                    type="search"
                    name="q"
                    className="form-control"
                    placeholder="Cari produk..."
                    required
                    aria-label="Cari produk"
                    maxLength={200}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-submit" aria-label="Kirim pencarian">Cari</button>
                </form>
              </div>
              <Link className="nav-link text-uppercase text-dark" href="/#header" onClick={() => setIsNavOpen(false)}>home</Link>
            </li>
            <li className="nav-item px-2 py-2">
              <Link className="nav-link text-uppercase text-dark" href="/#collection" onClick={() => setIsNavOpen(false)}>collection</Link>
            </li>
            <li className="nav-item px-2 py-2">
              <Link className="nav-link text-uppercase text-dark" href="/#special" onClick={() => setIsNavOpen(false)}>specials</Link>
            </li>
            <li className="nav-item px-2 py-2">
              <Link className="nav-link text-uppercase text-dark" href="/#blogs" onClick={() => setIsNavOpen(false)}>blogs</Link>
            </li>
            <li className="nav-item px-2 py-2">
              <Link className="nav-link text-uppercase text-dark" href="/#about" onClick={() => setIsNavOpen(false)}>about us</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
