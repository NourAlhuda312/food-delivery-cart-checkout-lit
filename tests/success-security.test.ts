import { describe, expect, it } from 'vitest';
import type { MealItem, ShippingAddress } from '../src/contracts';
import { buildCompletedOrder } from '../src/order/build-order';
import { completeOrderHandoff } from '../src/order/complete-order';
import { EVENT_CART_UPDATED, EVENT_ORDER_COMPLETED } from '../src/events/public-events';
import { CART_STORAGE_KEY, saveCart } from '../src/storage/cart-storage';

const item: MealItem = { id:'meal-101',restaurantId:'rest-01',restaurantName:'Burger House',name:'Classic Cheeseburger',description:'x',price:100,image:'x',category:'Burgers',quantity:1 };
const address: ShippingAddress = {label:'Work',fullName:'Nour',phone:'+970 599 123 456',city:'Nablus',area:'Rafidia',streetAddress:'Main',building:'10'};
class SpyStorage { entries = new Map<string,string>(); getItem(k:string){return this.entries.get(k)??null} setItem(k:string,v:string){this.entries.set(k,v)} }

describe('successful order and security sequence', () => {
  it('confirmation contract reflects ASAP and selected payment without card secrets', () => {
    const order = buildCompletedOrder({items:[item],shippingAddress:address,deliveryMethod:'asap',scheduledFor:null,paymentMethod:'mock-card',orderId:'YTD-SECURE01',now:new Date('2026-08-08T12:00:00Z')});
    expect(order.estimatedDeliveryMinutes).toBe(30);
    expect(order.paymentMethod).toBe('mock-card');
    expect(order).not.toHaveProperty('cardNumber');
    expect(order).not.toHaveProperty('cvv');
    expect(JSON.stringify(order)).not.toContain('4242424242424242');
  });

  it('scheduled order keeps the exact selected ISO and uses null estimate', () => {
    const scheduledFor='2026-08-09T12:30:00.000Z';
    const order=buildCompletedOrder({items:[item],shippingAddress:address,deliveryMethod:'scheduled',scheduledFor,paymentMethod:'cash',orderId:'YTD-SCHED001'});
    expect(order.scheduledFor).toBe(scheduledFor);
    expect(order.estimatedDeliveryMinutes).toBeNull();
  });

  it('emits order:completed before empty cart:updated and persists empty cart', () => {
    const order=buildCompletedOrder({items:[item],shippingAddress:address,deliveryMethod:'asap',scheduledFor:null,paymentMethod:'cash',orderId:'YTD-SEQUENCE'});
    const target=new EventTarget();
    const sequence:string[]=[];
    target.addEventListener(EVENT_ORDER_COMPLETED,()=>sequence.push(EVENT_ORDER_COMPLETED));
    target.addEventListener(EVENT_CART_UPDATED,()=>sequence.push(EVENT_CART_UPDATED));
    const storage=new SpyStorage();
    saveCart(storage,[item]);
    completeOrderHandoff(target,order,storage,()=>sequence.push('cart-cleared'));
    expect(sequence).toEqual([EVENT_ORDER_COMPLETED,'cart-cleared',EVENT_CART_UPDATED]);
    expect(storage.entries.get(CART_STORAGE_KEY)).toBe('[]');
  });

  it('empty cart:updated follows success with zero numeric values and ILS', () => {
    const order=buildCompletedOrder({items:[item],shippingAddress:address,deliveryMethod:'asap',scheduledFor:null,paymentMethod:'cash',orderId:'YTD-SEQUENCE'});
    const target=new EventTarget();
    let detail:unknown;
    target.addEventListener(EVENT_CART_UPDATED,(event)=>{detail=(event as CustomEvent).detail});
    completeOrderHandoff(target,order,new SpyStorage());
    expect(detail).toEqual({itemCount:0,subtotal:0,discount:0,deliveryFee:0,total:0,restaurantId:null,currency:'ILS'});
  });

  it('cart persistence never writes transient card number or CVV', () => {
    const storage=new SpyStorage();
    saveCart(storage,[item]);
    const raw=storage.entries.get(CART_STORAGE_KEY)!;
    expect(raw).not.toContain('4242424242424242');
    expect(raw).not.toContain('123');
    expect(JSON.parse(raw)[0]).toEqual(item);
  });
});
