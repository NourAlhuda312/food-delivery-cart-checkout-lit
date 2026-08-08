import { describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY, loadCart, saveCart } from '../src/storage/cart-storage';
import type { MealItem } from '../src/contracts';

const burger: MealItem = { id:'meal-101', restaurantId:'rest-01', restaurantName:'Burger House', name:'Classic Cheeseburger', description:'x', price:35, image:'x', category:'Burgers', quantity:2 };

class MemoryStorage {
  private data = new Map<string,string>();
  getItem(key:string){ return this.data.get(key) ?? null; }
  setItem(key:string,value:string){ this.data.set(key,value); }
}

describe('cart persistence', () => {
  it('uses exactly yum-ta-dum-cart', () => expect(CART_STORAGE_KEY).toBe('yum-ta-dum-cart'));
  it('restores persisted cart data', () => {
    const storage = new MemoryStorage();
    saveCart(storage,[burger]);
    expect(loadCart(storage)).toEqual({ items:[burger], failed:false });
  });
  it('handles JSON parse failure without throwing', () => {
    const storage = new MemoryStorage();
    storage.setItem(CART_STORAGE_KEY,'{bad json');
    expect(loadCart(storage)).toEqual({ items:[], failed:true });
  });
  it('handles unavailable storage', () => expect(saveCart(null,[burger])).toEqual({ failed:true }));
  it('handles quota/storage errors while leaving the caller-owned cart untouched', () => {
    const storage = { getItem:()=>null, setItem:()=>{ throw new Error('quota'); } };
    const inMemory = [burger];
    expect(saveCart(storage,inMemory)).toEqual({ failed:true });
    expect(inMemory).toEqual([burger]);
  });
});
