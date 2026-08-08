import { describe, expect, it } from 'vitest';
import {
  DECLINE_CARD, SUCCESS_CARD, WALLET_BALANCE, evaluateMockCard, evaluateMockPayment,
  normalizeCardNumber, validateCardDetails, validateExpiry,
} from '../src/payment/mock-payment';
import { SubmissionGate } from '../src/payment/submission-gate';

const now = new Date('2026-08-08T12:00:00Z');
const base = { cardholderName:'Nour Al-Huda', cardNumber:'4242 4242 4242 4242', expiry:'12/30', cvv:'123' };

describe('deterministic mock payment', () => {
  it('normalizes card number to digits only', () => expect(normalizeCardNumber('4242 4242-4242 4242')).toBe(SUCCESS_CARD));
  it('rejects malformed card data before processing', () => expect(evaluateMockCard({...base,cardNumber:'4242'},now)).toBe('invalid'));
  it('rejects expired cards', () => {
    expect(validateExpiry('07/26',now)).toBe(false);
    expect(evaluateMockCard({...base,expiry:'07/26'},now)).toBe('invalid');
  });
  it('4242424242424242 deterministically succeeds', () => expect(evaluateMockCard(base,now)).toBe('success'));
  it('4000000000000002 deterministically declines', () => expect(evaluateMockCard({...base,cardNumber:DECLINE_CARD},now)).toBe('decline'));
  it('returns the same result repeatedly without randomness', () => {
    expect(Array.from({length:10},()=>evaluateMockCard({...base,cardNumber:DECLINE_CARD},now))).toEqual(Array(10).fill('decline'));
  });
  it('validates cardholder, 16 digits, expiry, and 3-digit CVV', () => expect(validateCardDetails({cardholderName:'',cardNumber:'1',expiry:'00/00',cvv:'1'},now)).toEqual({
    cardholderName:'Enter the cardholder name.', cardNumber:'Enter a valid 16-digit card number.', expiry:'Enter a valid, unexpired date in MM/YY format.', cvv:'Enter a valid 3-digit CVV.'
  }));
  it('cash succeeds', () => expect(evaluateMockPayment('cash',999,base,now)).toBe('success'));
  it('wallet succeeds at or below ₪75', () => {
    expect(WALLET_BALANCE).toBe(75);
    expect(evaluateMockPayment('mock-wallet',75,base,now)).toBe('success');
  });
  it('wallet fails above ₪75 as insufficient, not exception', () => expect(evaluateMockPayment('mock-wallet',75.01,base,now)).toBe('insufficient-wallet'));
  it('submission gate blocks duplicate submits until released', () => {
    const gate = new SubmissionGate();
    expect(gate.begin()).toBe(true);
    expect(gate.begin()).toBe(false);
    gate.end();
    expect(gate.begin()).toBe(true);
  });
});
