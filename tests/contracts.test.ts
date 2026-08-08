import { describe, expect, it } from 'vitest';
import type { CompletedOrder, MealItem, ShippingAddress } from '../src/contracts';
import { calculateCartSummary } from '../src/state/cart';
import { buildCompletedOrder } from '../src/order/build-order';

const item: MealItem = {
  id: 'meal-101', restaurantId: 'rest-01', restaurantName: 'Burger House', name: 'Classic Cheeseburger',
  description: 'Demo', price: 35, image: 'https://example.test/burger.jpg', category: 'Burgers', quantity: 2,
};
const address: ShippingAddress = {
  label: 'Home', fullName: 'Nour Student', phone: '+970 599 111 222', city: 'Nablus', area: 'Rafidia',
  streetAddress: 'Main Street', building: '10', postalCode: '00000',
};

describe('public contracts', () => {
  it('uses the exact MealItem field set in fixtures', () => {
    expect(Object.keys(item).sort()).toEqual(['category','description','id','image','name','price','quantity','restaurantId','restaurantName'].sort());
    expect(typeof item.price).toBe('number');
  });

  it('uses streetAddress, not street, in ShippingAddress', () => {
    expect(address).toHaveProperty('streetAddress', 'Main Street');
    expect(address).not.toHaveProperty('street');
  });

  it('calculates the exact cart:updated shape with numeric money and ILS currency', () => {
    const detail = calculateCartSummary([item]);
    expect(Object.keys(detail).sort()).toEqual(['currency','deliveryFee','discount','itemCount','restaurantId','subtotal','total'].sort());
    expect(detail).toEqual({ itemCount: 2, subtotal: 70, discount: 0, deliveryFee: 10, total: 80, restaurantId: 'rest-01', currency: 'ILS' });
    expect(typeof detail.total).toBe('number');
  });

  it('generates a CompletedOrder with all required values', () => {
    const order: CompletedOrder = buildCompletedOrder({
      items: [item], shippingAddress: address, deliveryMethod: 'asap', scheduledFor: null,
      paymentMethod: 'cash', orderId: 'YTD-TEST0001', now: new Date('2026-08-08T12:00:00.000Z'),
    });
    expect(Object.keys(order).sort()).toEqual([
      'orderId','userId','restaurantId','restaurantName','items','shippingAddress','deliveryMethod','scheduledFor',
      'estimatedDeliveryMinutes','subtotal','discount','deliveryFee','total','currency','paymentMethod','status','createdAt',
    ].sort());
    expect(order).toMatchObject({
      orderId: 'YTD-TEST0001', userId: null, restaurantId: 'rest-01', restaurantName: 'Burger House',
      deliveryMethod: 'asap', scheduledFor: null, estimatedDeliveryMinutes: 30, subtotal: 70, discount: 0,
      deliveryFee: 10, total: 80, currency: 'ILS', paymentMethod: 'cash', status: 'confirmed', createdAt: '2026-08-08T12:00:00.000Z',
    });
    expect(typeof order.total).toBe('number');
  });
});
