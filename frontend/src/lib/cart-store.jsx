"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
const useCart = create()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      coupon: null,
      addItem: (item) => set((state) => {
        const existing = state.lines.find((l) => l.id === item.id);
        if (existing) {
          return {
            lines: state.lines.map(
              (l) => l.id === item.id ? { ...l, qty: l.qty + 1 } : l
            )
          };
        }
        return { lines: [...state.lines, { ...item, qty: 1 }] };
      }),
      removeItem: (id) => set((state) => ({
        lines: state.lines.filter((l) => l.id !== id)
      })),
      increment: (id) => set((state) => ({
        lines: state.lines.map(
          (l) => l.id === id ? { ...l, qty: l.qty + 1 } : l
        )
      })),
      decrement: (id) => set((state) => ({
        lines: state.lines.map((l) => l.id === id ? { ...l, qty: l.qty - 1 } : l).filter((l) => l.qty > 0)
      })),
      clear: () => set({ lines: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.qty, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
      applyCoupon: (couponData) => set({ coupon: couponData }),
      clearCoupon: () => set({ coupon: null })
    }),
    {
      name: "flame-crust-cart",
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon })
    }
  )
);
export {
  useCart
};
