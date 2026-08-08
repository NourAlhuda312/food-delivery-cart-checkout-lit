import { describe, expect, it } from 'vitest';
import {
  EVENT_CART_UPDATED, EVENT_NAVIGATION_REQUESTED, EVENT_ORDER_COMPLETED,
  dispatchCartUpdated, dispatchNavigationRequested, dispatchOrderCompleted,
} from '../src/events/public-events';
import type { CompletedOrder } from '../src/contracts';

const order = {
  orderId:'YTD-TEST0001', userId:null, restaurantId:'rest-01', restaurantName:'Burger House', items:[],
  shippingAddress:{label:'Home',fullName:'Nour',phone:'+970 599 123 456',city:'Nablus',streetAddress:'Main'},
  deliveryMethod:'asap', scheduledFor:null, estimatedDeliveryMinutes:30, subtotal:0, discount:0, deliveryFee:0,
  total:0, currency:'ILS', paymentMethod:'cash', status:'confirmed', createdAt:'2026-08-08T12:00:00.000Z',
} satisfies CompletedOrder;

describe('public events', () => {
  it('cart:updated bubbles and is composed', () => {
    const target = new EventTarget();
    const event = dispatchCartUpdated(target,{itemCount:2,subtotal:70,discount:0,deliveryFee:10,total:80,restaurantId:'rest-01',currency:'ILS'});
    expect(event.type).toBe(EVENT_CART_UPDATED);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });
  it('navigation:requested preserves the exact route', () => {
    const event = dispatchNavigationRequested(new EventTarget(),'/checkout/delivery');
    expect(event.type).toBe(EVENT_NAVIGATION_REQUESTED);
    expect(event.detail).toEqual({route:'/checkout/delivery'});
  });
  it('order:completed wraps the exact order payload', () => {
    const event = dispatchOrderCompleted(new EventTarget(),{order});
    expect(event.type).toBe(EVENT_ORDER_COMPLETED);
    expect(event.detail).toEqual({order});
    expect(event.bubbles && event.composed).toBe(true);
  });
});
