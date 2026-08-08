import { describe, expect, it } from 'vitest';
import type { MealItem } from '../src/contracts';
import {
  addOrIncrement, calculateCartSummary, calculateDeliveryFee, calculateSubtotal, hasRestaurantConflict,
  MAX_QUANTITY, removeItem, restoreRemovedItem, setQuantity,
} from '../src/state/cart';

const burger: MealItem = { id:'meal-101', restaurantId:'rest-01', restaurantName:'Burger House', name:'Classic Cheeseburger', description:'x', price:35, image:'x', category:'Burgers', quantity:1 };
const fries: MealItem = { id:'meal-104', restaurantId:'rest-01', restaurantName:'Burger House', name:'Loaded House Fries', description:'x', price:24, image:'x', category:'Sides', quantity:1 };
const musakhan: MealItem = { id:'meal-201', restaurantId:'rest-02', restaurantName:'Olive & Zaatar', name:'Musakhan Rolls', description:'x', price:42, image:'x', category:'Main', quantity:1 };

describe('cart business rules', () => {
  it('starts with an empty zero summary', () => expect(calculateCartSummary([])).toEqual({ itemCount:0, subtotal:0, discount:0, deliveryFee:0, total:0, restaurantId:null, currency:'ILS' }));

  it('receives an item into an empty cart', () => {
    const result = addOrIncrement([], burger);
    expect(result.items).toEqual([burger]);
  });

  it('increments the same meal rather than adding a second row', () => {
    const result = addOrIncrement([burger], burger);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(2);
  });

  it('caps quantity at 10 and reports the cap', () => {
    const ten = { ...burger, quantity: MAX_QUANTITY };
    const result = addOrIncrement([ten], burger);
    expect(result.items[0].quantity).toBe(10);
    expect(result.capped).toBe(true);
  });

  it('setQuantity also caps at 10', () => {
    const result = setQuantity([burger], burger.id, 99);
    expect(result.items[0].quantity).toBe(10);
    expect(result.capped).toBe(true);
  });

  it('accepts another meal from the same restaurant', () => expect(hasRestaurantConflict([burger], fries)).toBe(false));
  it('flags a second restaurant without mutating the current cart', () => {
    const current = [burger];
    expect(hasRestaurantConflict(current, musakhan)).toBe(true);
    expect(current).toEqual([burger]);
  });

  it('supports Clear and add by adding the pending item to an empty array', () => {
    const result = addOrIncrement([], musakhan);
    expect(result.items).toEqual([musakhan]);
  });

  it('calculates subtotal from unit price × quantities', () => {
    expect(calculateSubtotal([{...burger,quantity:2},{...fries,quantity:3}])).toBe(142);
  });

  it('charges ₪10 below ₪100 and free delivery at or above ₪100', () => {
    expect(calculateDeliveryFee(99.99)).toBe(10);
    expect(calculateDeliveryFee(100)).toBe(0);
    expect(calculateDeliveryFee(150)).toBe(0);
  });

  it('itemCount is the quantity sum, not number of rows', () => {
    expect(calculateCartSummary([{...burger,quantity:2},{...fries,quantity:3}]).itemCount).toBe(5);
  });

  it('explicit removal returns the exact removed item and previous position', () => {
    const result = removeItem([burger, fries], burger.id);
    expect(result.items).toEqual([fries]);
    expect(result.removed).toEqual({ item: burger, index: 0 });
  });

  it('Undo restores exact previous quantity and logical position', () => {
    const original = [{...burger,quantity:4}, fries];
    const removed = removeItem(original, burger.id);
    expect(removed.removed).not.toBeNull();
    const restored = restoreRemovedItem(removed.items, removed.removed!);
    expect(restored).toEqual(original);
  });
});
