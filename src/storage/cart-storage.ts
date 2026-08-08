import type { MealItem } from '../contracts';
import { isMealItem, normalizeIncomingItem } from '../state/cart';

export const CART_STORAGE_KEY = 'yum-ta-dum-cart';
export const STORAGE_WARNING = "We couldn't save your cart just now — it's still safe in this session.";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LoadCartResult { items: MealItem[]; failed: boolean }
export interface SaveCartResult { failed: boolean }

export function loadCart(storage: StorageLike | null | undefined): LoadCartResult {
  if (!storage) return { items: [], failed: true };
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [], failed: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], failed: true };
    return { items: parsed.filter(isMealItem).map(normalizeIncomingItem), failed: false };
  } catch {
    return { items: [], failed: true };
  }
}

export function saveCart(storage: StorageLike | null | undefined, items: MealItem[]): SaveCartResult {
  if (!storage) return { failed: true };
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    return { failed: false };
  } catch {
    return { failed: true };
  }
}
