import { describe, expect, it } from 'vitest';
import type { ShippingAddress } from '../src/contracts';
import { buildTimeOptions, dateInputValue, isValidPhone, toLocalIso, validateAddress, validateDelivery } from '../src/validation/delivery';

const valid: ShippingAddress = { label:'Home', fullName:'Nour Al-Huda', phone:'+970 599 123 456', city:'Nablus', streetAddress:'Main Street' };

describe('delivery validation', () => {
  it('requires the exact required address fields', () => expect(validateAddress({...valid,fullName:'',phone:'',city:'',streetAddress:''})).toEqual({
    fullName:'Enter your full name.', phone:'Enter a valid phone number, e.g. +970 5XX XXX XXX.', city:'Enter your city.', streetAddress:'Enter your street address.'
  }));
  it('accepts digits, + and spaces with at least seven normalized digits', () => {
    expect(isValidPhone('+970 599 123 456')).toBe(true);
    expect(isValidPhone('123 4567')).toBe(true);
    expect(isValidPhone('12-34567')).toBe(false);
    expect(isValidPhone('123456')).toBe(false);
  });
  it('ASAP does not require a schedule', () => expect(validateDelivery(valid,'asap',null,new Date('2026-08-08T10:00:00Z')).schedule).toBeUndefined());
  it('rejects scheduled delivery in the past', () => expect(validateDelivery(valid,'scheduled','2026-08-08T09:00:00Z',new Date('2026-08-08T10:00:00Z')).schedule).toBe('Choose a future delivery date and time.'));
  it('accepts a future scheduled ISO date/time', () => expect(validateDelivery(valid,'scheduled','2026-08-09T12:00:00Z',new Date('2026-08-08T10:00:00Z')).schedule).toBeUndefined());
  it('today time options exclude already passed times', () => {
    const now = new Date(2026,7,8,14,10,0);
    const options = buildTimeOptions(dateInputValue(now),now);
    expect(options).not.toContain('14:00');
    expect(options).toContain('14:30');
  });
  it('creates a future ISO value from native date/time controls', () => expect(toLocalIso('2026-08-09','12:30')).toMatch(/^2026-08-09T/));
});
