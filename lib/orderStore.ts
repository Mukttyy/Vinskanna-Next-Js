'use client';

import { storeConfig, BankAccount } from '@/data/config';
import { useState, useEffect, useCallback } from 'react';

export type OrderStatus = 'belum_dibayar' | 'dikemas' | 'dikirim' | 'selesai';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export interface ProductReview {
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  customer: CustomerInfo;
  bank: BankAccount;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  auditedAt?: string;
  shippedAt?: string;
  trackingNumber?: string;
  completedAt?: string;
  reviews?: Record<string, ProductReview>; // productId -> review
}

const ORDERS_KEY = `${storeConfig.storagePrefix}:orders`;
const CHECKOUT_SELECTED_KEY = `${storeConfig.storagePrefix}:checkout_selected`;

// Read orders from localStorage
export function readOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Write orders to localStorage
export function writeOrders(orders: Order[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('vinskanna:orders-updated'));
    return true;
  } catch {
    return false;
  }
}

// Store temporary selected IDs for checkout
export function setCheckoutSelectedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHECKOUT_SELECTED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function getCheckoutSelectedIds(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CHECKOUT_SELECTED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutSelectedIds(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CHECKOUT_SELECTED_KEY);
  } catch {
    // ignore
  }
}

// Generate human-friendly Order ID
export function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

// Order management actions
export function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'status' | 'reviews'>
): Order {
  const order: Order = {
    ...data,
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: 'belum_dibayar',
    reviews: {}
  };

  const current = readOrders();
  writeOrders([order, ...current]);
  return order;
}

export function getOrderById(id: string): Order | undefined {
  const orders = readOrders();
  return orders.find((o) => o.id === id);
}

export function updateOrder(id: string, updater: (order: Order) => Order): boolean {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return false;

  const updatedOrder = updater(orders[index]);
  orders[index] = updatedOrder;
  return writeOrders([...orders]);
}

export function uploadPaymentProof(orderId: string, proofUrl: string): boolean {
  return updateOrder(orderId, (order) => ({
    ...order,
    paymentProofUrl: proofUrl,
    paymentProofUploadedAt: new Date().toISOString()
  }));
}

// Audit manual confirmation by store admin: status moves to 'dikemas'
export function auditConfirmPayment(orderId: string): boolean {
  return updateOrder(orderId, (order) => ({
    ...order,
    status: 'dikemas',
    auditedAt: new Date().toISOString()
  }));
}

// Shipping confirmation by store: status moves to 'dikirim'
export function shipOrder(orderId: string, trackingNumber?: string): boolean {
  return updateOrder(orderId, (order) => ({
    ...order,
    status: 'dikirim',
    shippedAt: new Date().toISOString(),
    trackingNumber: trackingNumber || `VIN-EXP-${Math.floor(100000 + Math.random() * 900000)}`
  }));
}

// Completed by buyer or auto-completed: status moves to 'selesai'
export function completeOrder(orderId: string): boolean {
  return updateOrder(orderId, (order) => ({
    ...order,
    status: 'selesai',
    completedAt: new Date().toISOString()
  }));
}

// Add/update review for a product in an order
export function addProductReview(
  orderId: string,
  productId: string,
  review: { rating: number; comment: string }
): boolean {
  return updateOrder(orderId, (order) => {
    const reviews = { ...(order.reviews || {}) };
    reviews[productId] = {
      ...review,
      createdAt: new Date().toISOString()
    };
    return {
      ...order,
      reviews
    };
  });
}

// React hook for orders state
export function useOrdersState() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setOrders(readOrders());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('vinskanna:orders-updated', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('vinskanna:orders-updated', onStorage);
    };
  }, [refresh]);

  return {
    orders,
    isLoaded,
    refresh
  };
}
