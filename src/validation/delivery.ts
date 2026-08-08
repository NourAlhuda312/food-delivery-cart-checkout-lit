import type { DeliveryMethod, ShippingAddress } from '../contracts';

export interface DeliveryErrors {
  fullName?: string;
  phone?: string;
  city?: string;
  streetAddress?: string;
  schedule?: string;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isValidPhone(phone: string): boolean {
  return /^[+\d ]+$/.test(phone.trim()) && normalizePhone(phone).length >= 7;
}

export function validateAddress(address: ShippingAddress): DeliveryErrors {
  const errors: DeliveryErrors = {};
  if (!address.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!isValidPhone(address.phone)) errors.phone = 'Enter a valid phone number, e.g. +970 5XX XXX XXX.';
  if (!address.city.trim()) errors.city = 'Enter your city.';
  if (!address.streetAddress.trim()) errors.streetAddress = 'Enter your street address.';
  return errors;
}

export function isFutureIsoDateTime(value: string | null, now = new Date()): boolean {
  if (!value) return false;
  const selected = new Date(value);
  return !Number.isNaN(selected.getTime()) && selected.getTime() > now.getTime();
}

export function validateDelivery(address: ShippingAddress, method: DeliveryMethod, scheduledFor: string | null, now = new Date()): DeliveryErrors {
  const errors = validateAddress(address);
  if (method === 'scheduled' && !isFutureIsoDateTime(scheduledFor, now)) errors.schedule = 'Choose a future delivery date and time.';
  return errors;
}

export function toLocalIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function dateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildTimeOptions(selectedDate: string, now = new Date()): string[] {
  const options: string[] = [];
  if (!selectedDate) return options;
  const today = dateInputValue(now);
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      if (selectedDate === today) {
        const candidate = new Date(`${selectedDate}T${value}:00`);
        if (candidate.getTime() <= now.getTime()) continue;
      }
      options.push(value);
    }
  }
  return options;
}
