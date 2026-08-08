import type { CompletedOrder } from '../contracts';
import { dispatchCartUpdated, dispatchOrderCompleted } from '../events/public-events';
import { calculateCartSummary } from '../state/cart';
import { saveCart, type StorageLike } from '../storage/cart-storage';

export interface CompleteOrderResult {
  order: CompletedOrder;
  storageFailed: boolean;
}

/** Runs the SRS success handoff in public-contract order. */
export function completeOrderHandoff(
  target: EventTarget,
  order: CompletedOrder,
  storage: StorageLike | null | undefined,
  clearInMemoryCart: () => void = () => undefined,
): CompleteOrderResult {
  dispatchOrderCompleted(target, { order });
  clearInMemoryCart();
  const storageResult = saveCart(storage, []);
  dispatchCartUpdated(target, calculateCartSummary([]));
  return { order, storageFailed: storageResult.failed };
}
