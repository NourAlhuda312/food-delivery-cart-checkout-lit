import type { PaymentMethod } from '../contracts';

export const SUCCESS_CARD = '4242424242424242';
export const DECLINE_CARD = '4000000000000002';
export const WALLET_BALANCE = 75;

export type MockCardResult = 'success' | 'decline' | 'invalid';
export type MockPaymentResult = 'success' | 'decline' | 'invalid' | 'insufficient-wallet';

export interface CardDetails {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface CardValidationErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

export function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateExpiry(value: string, now = new Date()): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiryBoundary = new Date(year, month, 1, 0, 0, 0, 0);
  const currentMonthBoundary = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  return expiryBoundary > currentMonthBoundary;
}

export function validateCardDetails(details: CardDetails, now = new Date()): CardValidationErrors {
  const errors: CardValidationErrors = {};
  if (!details.cardholderName.trim()) errors.cardholderName = 'Enter the cardholder name.';
  if (!/^[\d ]+$/.test(details.cardNumber.trim()) || normalizeCardNumber(details.cardNumber).length !== 16) errors.cardNumber = 'Enter a valid 16-digit card number.';
  if (!validateExpiry(details.expiry, now)) errors.expiry = 'Enter a valid, unexpired date in MM/YY format.';
  if (!/^\d{3}$/.test(details.cvv.trim())) errors.cvv = 'Enter a valid 3-digit CVV.';
  return errors;
}

export function evaluateMockCard(details: CardDetails, now = new Date()): MockCardResult {
  if (Object.keys(validateCardDetails(details, now)).length > 0) return 'invalid';
  const number = normalizeCardNumber(details.cardNumber);
  if (number === DECLINE_CARD) return 'decline';
  if (number === SUCCESS_CARD) return 'success';
  return 'success';
}

export function evaluateMockPayment(method: PaymentMethod, total: number, card: CardDetails, now = new Date()): MockPaymentResult {
  if (method === 'cash') return 'success';
  if (method === 'mock-wallet') return total <= WALLET_BALANCE ? 'success' : 'insufficient-wallet';
  const result = evaluateMockCard(card, now);
  return result;
}
