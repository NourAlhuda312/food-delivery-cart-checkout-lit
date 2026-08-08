import type { CompletedOrder, DeliveryMethod, MealItem, PaymentMethod, ShippingAddress } from '../contracts';
import { calculateCartSummary } from '../state/cart';

export interface BuildOrderInput {
  items: MealItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  scheduledFor: string | null;
  paymentMethod: PaymentMethod;
  userId?: string | null;
  now?: Date;
  orderId?: string;
}

export function createOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint32Array(8);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = (Date.now() + index * 17) >>> 0;
  return `YTD-${Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('')}`;
}

export function buildCompletedOrder(input: BuildOrderInput): CompletedOrder {
  if (input.items.length === 0) throw new Error('Cannot complete an empty cart.');
  const summary = calculateCartSummary(input.items);
  const first = input.items[0];
  const now = input.now ?? new Date();
  return {
    orderId: input.orderId ?? createOrderId(),
    userId: input.userId ?? null,
    restaurantId: first.restaurantId,
    restaurantName: first.restaurantName,
    items: input.items.map((item) => ({ ...item })),
    shippingAddress: { ...input.shippingAddress },
    deliveryMethod: input.deliveryMethod,
    scheduledFor: input.deliveryMethod === 'scheduled' ? input.scheduledFor : null,
    estimatedDeliveryMinutes: input.deliveryMethod === 'asap' ? 30 : null,
    subtotal: summary.subtotal,
    discount: summary.discount,
    deliveryFee: summary.deliveryFee,
    total: summary.total,
    currency: 'ILS',
    paymentMethod: input.paymentMethod,
    status: 'confirmed',
    createdAt: now.toISOString(),
  };
}
