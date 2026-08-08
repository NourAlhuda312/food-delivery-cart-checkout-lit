import type { CartAddItemDetail, CartUpdatedDetail, NavigationRequestedDetail, OrderCompletedDetail } from '../contracts';

export const EVENT_CART_ADD_ITEM = 'cart:add-item';
export const EVENT_CART_UPDATED = 'cart:updated';
export const EVENT_ORDER_COMPLETED = 'order:completed';
export const EVENT_NAVIGATION_REQUESTED = 'navigation:requested';

export function createPublicEvent<T>(name: string, detail: T): CustomEvent<T> {
  return new CustomEvent<T>(name, { detail, bubbles: true, composed: true });
}

export function dispatchCartUpdated(target: EventTarget, detail: CartUpdatedDetail): CustomEvent<CartUpdatedDetail> {
  const event = createPublicEvent(EVENT_CART_UPDATED, detail);
  target.dispatchEvent(event);
  return event;
}

export function dispatchOrderCompleted(target: EventTarget, detail: OrderCompletedDetail): CustomEvent<OrderCompletedDetail> {
  const event = createPublicEvent(EVENT_ORDER_COMPLETED, detail);
  target.dispatchEvent(event);
  return event;
}

export function dispatchNavigationRequested(target: EventTarget, route: string): CustomEvent<NavigationRequestedDetail> {
  const event = createPublicEvent(EVENT_NAVIGATION_REQUESTED, { route });
  target.dispatchEvent(event);
  return event;
}

export function readCartAddItemEvent(event: Event): CartAddItemDetail | null {
  if (!(event instanceof CustomEvent)) return null;
  const detail = event.detail as CartAddItemDetail | undefined;
  return detail?.item ? detail : null;
}
