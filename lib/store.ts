'use client';

import { allProducts, Product } from '@/data/products';
import { storeConfig } from '@/data/config';
import { useState, useEffect, useCallback } from 'react';

export interface CartItem extends Product {
  quantity: number;
}

export type WishlistItem = Product;

const key = (kind: 'cart' | 'wishlist') => `${storeConfig.storagePrefix}:${kind}`;
export const maxQuantity = storeConfig.maxQuantity;

export function money(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: CartItem[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || seen.has((entry as { id: string }).id)) continue;
    const product = allProducts.find(p => p.id === (entry as { id: string }).id);
    if (!product) continue;
    const quantity = (entry as { quantity: unknown }).quantity;
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > maxQuantity) continue;
    seen.add(product.id);
    result.push({ ...product, quantity: quantity as number });
  }
  return result;
}

export function normalizeWishlist(value: unknown): WishlistItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: WishlistItem[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || seen.has((entry as { id: string }).id)) continue;
    const product = allProducts.find(p => p.id === (entry as { id: string }).id);
    if (!product) continue;
    seen.add(product.id);
    result.push({ ...product });
  }
  return result;
}

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key('cart')) || '[]';
    return normalizeCart(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload = normalizeCart(items).map(p => ({ id: p.id, quantity: p.quantity }));
    window.localStorage.setItem(key('cart'), JSON.stringify(payload));
    window.dispatchEvent(new Event('vinskanna:cart-updated'));
    return true;
  } catch {
    return false;
  }
}

export function readWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key('wishlist')) || '[]';
    return normalizeWishlist(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload = normalizeWishlist(items).map(p => ({ id: p.id }));
    window.localStorage.setItem(key('wishlist'), JSON.stringify(payload));
    window.dispatchEvent(new Event('vinskanna:wishlist-updated'));
    return true;
  } catch {
    return false;
  }
}

// React Hooks for live reactivity
export function useStoreState() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setCart(readCart());
    setWishlist(readWishlist());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('vinskanna:cart-updated', onStorage);
    window.addEventListener('vinskanna:wishlist-updated', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('vinskanna:cart-updated', onStorage);
      window.removeEventListener('vinskanna:wishlist-updated', onStorage);
    };
  }, [refresh]);

  const addToCart = useCallback((productId: string): { success: boolean; message: string } => {
    const current = readCart();
    const existing = current.find(p => p.id === productId);
    if (existing && existing.quantity >= maxQuantity) {
      return { success: false, message: `Maksimal ${maxQuantity} per produk.` };
    }
    const product = allProducts.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan.' };

    let updated: CartItem[];
    if (existing) {
      updated = current.map(p => p.id === productId ? { ...p, quantity: p.quantity + 1 } : p);
    } else {
      updated = [...current, { ...product, quantity: 1 }];
    }

    if (writeCart(updated)) {
      setCart(updated);
      return { success: true, message: 'Produk ditambahkan ke keranjang.' };
    } else {
      return { success: false, message: 'Penyimpanan browser tidak tersedia atau penuh.' };
    }
  }, []);

  const toggleWishlist = useCallback((productId: string): { active: boolean; message: string } => {
    const current = readWishlist();
    const exists = current.some(p => p.id === productId);
    const product = allProducts.find(p => p.id === productId);
    if (!product) return { active: false, message: 'Produk tidak ditemukan.' };

    const updated = exists ? current.filter(p => p.id !== productId) : [...current, product];
    writeWishlist(updated);
    setWishlist(updated);
    return {
      active: !exists,
      message: exists ? 'Produk dihapus dari wishlist.' : 'Produk ditambahkan ke wishlist.'
    };
  }, []);

  const moveToCart = useCallback((productId: string): { success: boolean; message: string } => {
    const addResult = addToCart(productId);
    if (!addResult.success) return addResult;

    const currentWishlist = readWishlist();
    const updatedWishlist = currentWishlist.filter(p => p.id !== productId);
    writeWishlist(updatedWishlist);
    setWishlist(updatedWishlist);

    return { success: true, message: 'Produk dipindahkan ke keranjang belanja.' };
  }, [addToCart]);

  const updateCartQuantity = useCallback((productId: string, qty: number): boolean => {
    if (!Number.isInteger(qty) || qty < 1 || qty > maxQuantity) return false;
    const current = readCart();
    const updated = current.map(p => p.id === productId ? { ...p, quantity: qty } : p);
    const ok = writeCart(updated);
    if (ok) setCart(updated);
    return ok;
  }, []);

  const removeCartItem = useCallback((productId: string): boolean => {
    const current = readCart();
    const updated = current.filter(p => p.id !== productId);
    const ok = writeCart(updated);
    if (ok) setCart(updated);
    return ok;
  }, []);

  const removeSelectedCart = useCallback((selectedIds: string[]): boolean => {
    const idSet = new Set(selectedIds);
    const current = readCart();
    const updated = current.filter(p => !idSet.has(p.id));
    const ok = writeCart(updated);
    if (ok) setCart(updated);
    return ok;
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlistCount = wishlist.length;

  return {
    cart,
    wishlist,
    isLoaded,
    totalCartCount,
    totalWishlistCount,
    addToCart,
    toggleWishlist,
    moveToCart,
    updateCartQuantity,
    removeCartItem,
    removeSelectedCart,
    refresh
  };
}
