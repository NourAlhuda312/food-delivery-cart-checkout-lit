import type { PaymentMethod, ShippingAddress } from '../contracts';

export function formatILS(value: number): string {
  return `₪${value.toFixed(2)}`;
}

export function formatAddress(address: ShippingAddress): string {
  return [address.city, address.area, address.streetAddress, address.building].filter(Boolean).join(', ');
}

export function formatScheduledTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function paymentMethodLabel(method: PaymentMethod): string {
  if (method === 'cash') return 'Cash on Delivery';
  if (method === 'mock-card') return 'Mock Credit Card';
  return 'Yum Wallet — Demo';
}
