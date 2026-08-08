import type { CartUpdatedDetail, MealItem } from '../contracts';

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 10;
export const FREE_DELIVERY_THRESHOLD = 100;
export const STANDARD_DELIVERY_FEE = 10;
export const DISCOUNT = 0;

export interface CartMutationResult {
  items: MealItem[];
  capped: boolean;
}

export interface RemovedItemSnapshot {
  item: MealItem;
  index: number;
}

export function normalizeIncomingItem(item: MealItem): MealItem {
  const quantity = Number.isFinite(item.quantity) ? Math.trunc(item.quantity) : 1;
  return { ...item, quantity: Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity)) };
}

export function isMealItem(value: unknown): value is MealItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return ['id','restaurantId','restaurantName','name','description','image','category'].every((key) => typeof item[key] === 'string')
    && typeof item.price === 'number' && Number.isFinite(item.price)
    && typeof item.quantity === 'number' && Number.isFinite(item.quantity);
}

export function addOrIncrement(items: MealItem[], incoming: MealItem): CartMutationResult {
  const item = normalizeIncomingItem(incoming);
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index < 0) return { items: [...items, item], capped: incoming.quantity > MAX_QUANTITY };
  const next = [...items];
  const requested = next[index].quantity + item.quantity;
  next[index] = { ...next[index], quantity: Math.min(MAX_QUANTITY, requested) };
  return { items: next, capped: requested > MAX_QUANTITY };
}

export function setQuantity(items: MealItem[], itemId: string, quantity: number): CartMutationResult {
  const next = items.map((item) => {
    if (item.id !== itemId) return item;
    return { ...item, quantity: Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity))) };
  });
  return { items: next, capped: quantity > MAX_QUANTITY };
}

export function removeItem(items: MealItem[], itemId: string): { items: MealItem[]; removed: RemovedItemSnapshot | null } {
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) return { items, removed: null };
  const removed = { item: { ...items[index] }, index };
  return { items: items.filter((_, itemIndex) => itemIndex !== index), removed };
}

export function restoreRemovedItem(items: MealItem[], snapshot: RemovedItemSnapshot): MealItem[] {
  const withoutDuplicate = items.filter((item) => item.id !== snapshot.item.id);
  const index = Math.max(0, Math.min(snapshot.index, withoutDuplicate.length));
  return [...withoutDuplicate.slice(0, index), { ...snapshot.item }, ...withoutDuplicate.slice(index)];
}

export function calculateSubtotal(items: MealItem[]): number {
  return roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

export function calculateDeliveryFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
}

export function calculateCartSummary(items: MealItem[]): CartUpdatedDetail {
  const subtotal = calculateSubtotal(items);
  const deliveryFee = calculateDeliveryFee(subtotal);
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    discount: DISCOUNT,
    deliveryFee,
    total: roundMoney(subtotal - DISCOUNT + deliveryFee),
    restaurantId: items[0]?.restaurantId ?? null,
    currency: 'ILS',
  };
}

export function hasRestaurantConflict(items: MealItem[], incoming: MealItem): boolean {
  return items.length > 0 && items[0].restaurantId !== incoming.restaurantId;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
