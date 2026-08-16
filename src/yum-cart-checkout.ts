import { LitElement, html, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/dialog/dialog.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/divider/divider.js';
import yumyEmptyCart from './assets/yumy-empty-cart.png';
import yumyRestaurantConflict from './assets/yumy-restaurant-conflict.png';
import yumyOrderConfirmed from './assets/yumy-order-confirmed.png';
import yumyNoCompletedOrder from './assets/yumy-no-completed-order.png';
import { ensureMaterialSymbolsFont } from './ensure-material-symbols';
import type {
  CompletedOrder,
  DeliveryMethod,
  MealItem,
  PaymentMethod,
  ShippingAddress,
} from './contracts';
import {
  EVENT_CART_ADD_ITEM,
  dispatchCartUpdated,
  dispatchNavigationRequested,
  readCartAddItemEvent,
} from './events/public-events';
import { buildCompletedOrder } from './order/build-order';
import { completeOrderHandoff } from './order/complete-order';
import {
  DECLINE_CARD,
  SUCCESS_CARD,
  WALLET_BALANCE,
  evaluateMockCard,
  normalizeCardNumber,
  type CardDetails,
  type CardValidationErrors,
  validateCardDetails,
} from './payment/mock-payment';
import { SubmissionGate } from './payment/submission-gate';
import {
  FREE_DELIVERY_THRESHOLD,
  MAX_QUANTITY,
  addOrIncrement,
  calculateCartSummary,
  hasRestaurantConflict,
  isMealItem,
  removeItem,
  restoreRemovedItem,
  setQuantity,
  type RemovedItemSnapshot,
} from './state/cart';
import {
  STORAGE_WARNING,
  loadCart,
  saveCart,
  type StorageLike,
} from './storage/cart-storage';
import { componentStyles } from './styles/component';
import { themeStyles } from './styles/theme';
import { formatAddress, formatILS, formatScheduledTime, paymentMethodLabel } from './utils/format';
import {
  buildTimeOptions,
  dateInputValue,
  toLocalIso,
  validateDelivery,
  type DeliveryErrors,
} from './validation/delivery';

const ROUTES = ['/cart', '/checkout/delivery', '/checkout/payment', '/order-confirmation'] as const;
type CartRoute = (typeof ROUTES)[number];
type RecipientMode = 'guest' | 'saved';
type CheckoutCompanionStage = 'delivery' | 'payment' | 'confirmation';
const EMPTY_ADDRESS: ShippingAddress = {
  label: 'Home',
  fullName: '',
  phone: '',
  city: '',
  area: '',
  streetAddress: '',
  building: '',
  postalCode: '',
};

const SAVED_ADDRESS: ShippingAddress = {
  label: 'Home',
  fullName: 'Demo Nour',
  phone: '+970 599 123 456',
  city: 'Nablus',
  area: 'Rafidia',
  streetAddress: 'Al-Quds Street',
  building: 'Building 10',
  postalCode: '',
};

function asRoute(pathname: string): CartRoute {
  return ROUTES.includes(pathname as CartRoute) ? pathname as CartRoute : '/cart';
}

function cloneAddress(address: ShippingAddress): ShippingAddress {
  return { ...address };
}

export class YumCartCheckout extends LitElement {
  static styles: CSSResultGroup = [themeStyles, componentStyles];

  static properties = {
    items: { state: true },
    loading: { state: true },
    route: { state: true },
    storageWarning: { state: true },
    pendingConflictItem: { state: true },
    removedSnapshot: { state: true },
    snackbarMessage: { state: true },
    recipientMode: { state: true },
    shippingAddress: { state: true },
    deliveryMethod: { state: true },
    scheduleDate: { state: true },
    scheduleTime: { state: true },
    deliveryErrors: { state: true },
    paymentMethod: { state: true },
    cardDetails: { state: true },
    cardErrors: { state: true },
    processing: { state: true },
    paymentFailure: { state: true },
    completedOrder: { state: true },
  };

  private items: MealItem[] = [];
  private loading = true;
  private route: CartRoute = typeof window === 'undefined' ? '/cart' : asRoute(window.location.pathname);
  private storageWarning = false;
  private pendingConflictItem: MealItem | null = null;
  private removedSnapshot: RemovedItemSnapshot | null = null;
  private snackbarMessage = '';
  private recipientMode: RecipientMode = 'guest';
  private shippingAddress: ShippingAddress = cloneAddress(EMPTY_ADDRESS);
  private deliveryMethod: DeliveryMethod = 'asap';
  private scheduleDate = '';
  private scheduleTime = '';
  private deliveryErrors: DeliveryErrors = {};
  private paymentMethod: PaymentMethod = 'cash';
  private cardDetails: CardDetails = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' };
  private cardErrors: CardValidationErrors = {};
  private processing = false;
  private paymentFailure = false;
  private completedOrder: CompletedOrder | null = null;
  private snackbarTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly submissionGate = new SubmissionGate();

  private readonly handleWindowCartAdd = (event: Event): void => {
    const detail = readCartAddItemEvent(event);
    if (!detail || !isMealItem(detail.item)) return;
    const incoming = { ...detail.item };
 if (hasRestaurantConflict(this.items, incoming)) {
  this.requestNavigation('/cart');

  this.updateComplete.then(() => {
    this.pendingConflictItem = incoming;
  });

  return;
}
    const result = addOrIncrement(this.items, incoming);
    this.applyCart(result.items);
    if (result.capped) this.showSnackbar("You've reached the maximum quantity (10).");
  };

  private readonly handlePopState = (): void => {
    this.route = asRoute(window.location.pathname);
    if (this.route !== '/checkout/payment') this.clearSensitiveCardState(true);
  };

  
  connectedCallback(): void {
    
    super.connectedCallback();
    ensureMaterialSymbolsFont();
    
    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_CART_ADD_ITEM, this.handleWindowCartAdd);
      window.addEventListener('popstate', this.handlePopState);
    }
  }

  disconnectedCallback(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_CART_ADD_ITEM, this.handleWindowCartAdd);
      window.removeEventListener('popstate', this.handlePopState);
    }
    if (this.snackbarTimer) clearTimeout(this.snackbarTimer);
    this.clearSensitiveCardState(false);
    super.disconnectedCallback();
  }

  protected firstUpdated(): void {
    const restored = loadCart(this.getStorage());
    this.items = restored.items;
    this.storageWarning = restored.failed;
    this.loading = false;
    dispatchCartUpdated(this, calculateCartSummary(this.items));
  }

  protected render(): TemplateResult {
    const content = this.loading ? this.renderSkeleton() : this.renderRoute();
    return html`
      ${this.storageWarning ? html`
        <div class="storage-warning" role="status" aria-live="polite">
          <span class="material-symbols-outlined" aria-hidden="true">cloud_off</span>
          <span>${STORAGE_WARNING}</span>
        </div>
      ` : nothing}
      ${content}
      ${this.renderConflictDialog()}
      ${this.renderSnackbar()}
    `;
  }

  private renderRoute(): TemplateResult {
    if (this.route !== '/order-confirmation' && this.items.length === 0) return this.renderEmptyCart();
    switch (this.route) {
      case '/checkout/delivery': return this.renderDelivery();
      case '/checkout/payment': return this.renderPayment();
      case '/order-confirmation': return this.renderConfirmation();
      case '/cart':
      default: return this.renderCart();
    }
  }

  private renderSkeleton(): TemplateResult {
    return html`
      <main class="page" aria-busy="true" aria-label="Restoring cart">
        <h1>Your Cart</h1>
        <div class="skeleton-grid">
          <div class="skeleton-list" aria-hidden="true">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
          </div>
          <div class="skeleton summary-skeleton" aria-hidden="true"></div>
        </div>
        <span class="visually-hidden">Loading your saved cart.</span>
      </main>
    `;
  }

  private renderCart(): TemplateResult {
    const summary = calculateCartSummary(this.items);
    return html`
      <main class="page" aria-labelledby="cart-title">
        <h1 id="cart-title">Your Cart</h1>
        <div class="cart-layout">
          <section aria-label="Cart items">
            <p class="restaurant-heading">
              <span class="material-symbols-outlined" aria-hidden="true">storefront</span>
              <strong>${this.items[0]?.restaurantName}</strong>
            </p>
            <div class="cart-items">
              ${this.items.map((item) => this.renderCartItem(item))}
            </div>
          </section>
          ${this.renderSummary(summary)}
        </div>
        <div class="mobile-checkout" aria-label="Mobile checkout summary">
          <div><span class="supporting">Total</span><strong>${formatILS(summary.total)}</strong></div>
          <md-filled-button @click=${this.proceedToDelivery}>Checkout</md-filled-button>
        </div>
      </main>
    `;
  }

  private renderCartItem(item: MealItem): TemplateResult {
    const total = item.price * item.quantity;
    return html`
      <article class="card cart-item">
        <img src=${item.image} alt=${`${item.name} from ${item.restaurantName}`} loading="lazy" />
        <div class="item-main">
          <div class="item-title-row">
            <div>
              <h3>${item.name}</h3>
              <p class="supporting">${item.restaurantName}</p>
            </div>
            <md-icon-button
              aria-label=${`Remove ${item.name}`}
              title=${`Remove ${item.name}`}
              @click=${() => this.removeCartItem(item.id)}>
              <span class="material-symbols-outlined" aria-hidden="true">delete_outline</span>
            </md-icon-button>
          </div>
          <div class="item-bottom">
            <div>
              <div class="supporting">${formatILS(item.price)} each</div>
              <div class="quantity-control" aria-label=${`${item.name} quantity`}>
                <md-icon-button
                  aria-label=${`Decrease ${item.name} quantity`}
                  ?disabled=${item.quantity <= 1}
                  @click=${() => this.changeQuantity(item, item.quantity - 1)}>
                  <span class="material-symbols-outlined" aria-hidden="true">remove</span>
                </md-icon-button>
                <output aria-live="polite" aria-label=${`${item.name} quantity`}>${item.quantity}</output>
                <md-icon-button
                  aria-label=${`Increase ${item.name} quantity`}
                  @click=${() => this.changeQuantity(item, item.quantity + 1)}>
                  <span class="material-symbols-outlined" aria-hidden="true">add</span>
                </md-icon-button>
              </div>
            </div>
            <strong class="item-total">${formatILS(total)}</strong>
          </div>
        </div>
      </article>
    `;
  }

  private renderSummary(summary = calculateCartSummary(this.items)): TemplateResult {
    return html`
      <aside class="card summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Order Summary</h2>
        <div class="summary-row"><span>Subtotal</span><span>${formatILS(summary.subtotal)}</span></div>
        <div class="summary-row"><span>Discount</span><span>${formatILS(summary.discount)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${summary.deliveryFee === 0 ? 'Free' : formatILS(summary.deliveryFee)}</span></div>
        <div class="summary-row summary-total"><span>Total</span><span>${formatILS(summary.total)}</span></div>
        <div class="delivery-estimate">
          <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
          <span>Estimated delivery: <strong>25–35 minutes</strong></span>
        </div>
        ${this.renderFreeDeliveryJourney(summary.subtotal)}
        <div class="summary-actions">
          <md-filled-button @click=${this.proceedToDelivery}>Proceed to Checkout</md-filled-button>
          <md-outlined-button @click=${() => this.requestNavigation('/restaurants')}>Add more items</md-outlined-button>
        </div>
      </aside>
    `;
  }

  private renderFreeDeliveryJourney(subtotal: number): TemplateResult {
    const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
    const unlocked = subtotal >= FREE_DELIVERY_THRESHOLD;
    const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    return html`
      <section class="journey" aria-label="Free delivery progress">
        <div class="journey-copy">
          <span>${unlocked ? 'Free delivery unlocked!' : `${formatILS(remaining)} away from free delivery`}</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="journey-track" style=${`--journey:${progress / 100}`}>
          <div class="journey-line" aria-hidden="true"></div>
          <div class="journey-progress" aria-hidden="true"></div>
          <div class="journey-bag" aria-hidden="true"><span class="material-symbols-outlined">takeout_dining</span></div>
          <span class="journey-goal material-symbols-outlined" aria-hidden="true">flag</span>
        </div>
        <span class="visually-hidden">${unlocked ? 'Free delivery threshold reached.' : `${formatILS(remaining)} remaining until free delivery.`}</span>
      </section>
    `;
  }

  private renderEmptyCart(): TemplateResult {
    return html`
      <main class="page empty" aria-labelledby="empty-title">
        <div class="empty-inner">
<img
  class="status-mascot status-mascot--empty"
  src=${yumyEmptyCart}
  alt=""
  aria-hidden="true"
/>          <h1 id="empty-title">Your cart is hungry!</h1>
          <p>Yumy is waiting for something delicious.</p>
          <md-filled-button @click=${() => this.requestNavigation('/restaurants')}>Explore meals</md-filled-button>
        </div>
      </main>
    `;
  }

  private renderStepper(currentStep: 2 | 3 | 4): TemplateResult {
    const labels = ['Cart', 'Delivery', 'Payment', 'Confirm'];
    return html`
      <nav class="stepper" aria-label="Checkout progress">
        <span class="visually-hidden">Checkout step ${currentStep} of 4: ${labels[currentStep - 1]}</span>
        <ol class="stepper-list" aria-hidden="true">
          ${labels.map((label, index) => {
            const step = index + 1;
            const completed = step < currentStep;
            const current = step === currentStep;
            const className = `step${completed ? ' completed' : ''}${current ? ' current' : ''}`;
            return html`
              <li class=${className}>
                <span class="step-circle">
                  ${completed ? html`<span class="material-symbols-outlined" aria-hidden="true">check</span>` : step}
                </span>
                <span>${label}</span>
              </li>
            `;
          })}
        </ol>
      </nav>
    `;
  }

  private renderCheckoutCompanion(stage: CheckoutCompanionStage): TemplateResult {
  if (stage === 'delivery') {
    return html`
      <aside class="checkout-companion" aria-label="Delivery checkout tips">
        <span class="companion-sticker">YUMY TIP</span>

        <div class="companion-icon" aria-hidden="true">
          <span class="material-symbols-outlined">delivery_dining</span>
        </div>

        <h2>Good food is getting closer.</h2>
        <p>
          Tell us where Yumy should send your order and choose the timing
          that works for you.
        </p>

        <div class="companion-facts">
          <div>
            <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
            <span>
              <strong>25–35 min</strong>
              <small>Typical ASAP delivery</small>
            </span>
          </div>

          <div>
            <span class="material-symbols-outlined" aria-hidden="true">event</span>
            <span>
              <strong>Plan ahead</strong>
              <small>Schedule for later</small>
            </span>
          </div>

          <div>
            <span class="material-symbols-outlined" aria-hidden="true">restaurant</span>
            <span>
              <strong>One kitchen</strong>
              <small>One restaurant per order</small>
            </span>
          </div>
        </div>

        <p class="companion-signoff">
          Good food. Good mood. <strong>Yum Ta Dum.</strong>
        </p>
      </aside>
    `;
  }

  if (stage === 'payment') {
    return html`
      <aside class="checkout-companion" aria-label="Payment checkout information">
        <span class="companion-sticker">ALMOST THERE</span>

        <div class="companion-icon" aria-hidden="true">
          <span class="material-symbols-outlined">verified_user</span>
        </div>

        <h2>Your kitchen is waiting.</h2>
        <p>
          Pick a demo payment method, review the order, and send it to the
          kitchen.
        </p>

        <div class="companion-facts">
          <div>
            <span class="material-symbols-outlined" aria-hidden="true">science</span>
            <span>
              <strong>Demo only</strong>
              <small>No real charge is made</small>
            </span>
          </div>

          <div>
            <span class="material-symbols-outlined" aria-hidden="true">lock</span>
            <span>
              <strong>Transient card data</strong>
              <small>Card number and CVV are not stored</small>
            </span>
          </div>

          <div>
            <span class="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
            <span>
              <strong>${formatILS(WALLET_BALANCE)}</strong>
              <small>Demo wallet balance</small>
            </span>
          </div>
        </div>

        <p class="companion-signoff">
          One more tap, then <strong>Yum!</strong>
        </p>
      </aside>
    `;
  }

  return html`
    <aside class="checkout-companion checkout-companion--success"
      aria-label="Order confirmation message">

      <span class="companion-sticker">ORDER SENT</span>

      <div class="companion-icon" aria-hidden="true">
        <span class="material-symbols-outlined">restaurant</span>
      </div>

      <h2>From cart to kitchen.</h2>

      <p>
        Your checkout is complete and the order has been handed off through
        the Yum Ta Dum order contract.
      </p>

      <div class="companion-facts">
        <div>
          <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
          <span>
            <strong>Confirmed</strong>
            <small>Your order was created successfully</small>
          </span>
        </div>

        <div>
          <span class="material-symbols-outlined" aria-hidden="true">receipt_long</span>
          <span>
            <strong>Order ready</strong>
            <small>Available to Account & Orders</small>
          </span>
        </div>
      </div>

      <p class="companion-signoff">
        Good food. Good mood. <strong>Yum Ta Dum.</strong>
      </p>
    </aside>
  `;
}

  private renderDelivery(): TemplateResult {
    const minDate = dateInputValue(new Date());
    const timeOptions = buildTimeOptions(this.scheduleDate);
    const scheduledFor = toLocalIso(this.scheduleDate, this.scheduleTime);
    return html`
      <main class="page" aria-labelledby="delivery-title">
       ${this.renderStepper(2)}

<div class="checkout-shell">
  <div class="checkout-column">
          <section>
            <h1 id="delivery-title">Delivery Details</h1>
            <p class="supporting">Choose guest checkout or use the demo saved address. No real account is created.</p>
          </section>

          <section class="card" aria-labelledby="recipient-title">
            <h2 id="recipient-title">Recipient</h2>
            <div class="mode-toggle" role="group" aria-label="Checkout recipient mode">
              <button type="button" aria-pressed=${this.recipientMode === 'saved'} @click=${() => this.chooseRecipientMode('saved')}>My Account — Demo</button>
              <button type="button" aria-pressed=${this.recipientMode === 'guest'} @click=${() => this.chooseRecipientMode('guest')}>Guest Checkout</button>
            </div>
            ${this.recipientMode === 'saved' ? html`
              <div class="card saved-address" style="margin-top:16px">
                <span class="material-symbols-outlined" aria-hidden="true">home</span>
                <div>
                  <strong>Demo saved address</strong>
                  <div>${SAVED_ADDRESS.fullName} · ${SAVED_ADDRESS.phone}</div>
                  <div class="supporting">${formatAddress(SAVED_ADDRESS)}</div>
                </div>
              </div>
            ` : nothing}
          </section>

          <section class="card" aria-labelledby="address-title">
            <h2 id="address-title">Delivery Address</h2>
            <fieldset class="label-options">
              <legend>Label</legend>
              ${(['Home', 'Work', 'Other'] as const).map((label) => html`
                <label><input type="radio" name="address-label" .value=${label} .checked=${this.shippingAddress.label === label} @change=${() => this.updateAddress('label', label)} /> ${label}</label>
              `)}
            </fieldset>
            <div class="form-grid" style="margin-top:16px">
              ${this.renderTextField('fullName', 'Full Name', this.shippingAddress.fullName, this.deliveryErrors.fullName, false, 'text')}
              ${this.renderTextField('phone', 'Phone', this.shippingAddress.phone, this.deliveryErrors.phone, false, 'tel')}
              ${this.renderTextField('city', 'City', this.shippingAddress.city, this.deliveryErrors.city, false, 'text')}
              ${this.renderTextField('area', 'Area (optional)', this.shippingAddress.area ?? '', undefined, true, 'text')}
              <div class="wide">${this.renderTextField('streetAddress', 'Street Address', this.shippingAddress.streetAddress, this.deliveryErrors.streetAddress, false, 'text')}</div>
              ${this.renderTextField('building', 'Building (optional)', this.shippingAddress.building ?? '', undefined, true, 'text')}
              ${this.renderTextField('postalCode', 'Postal Code (optional)', this.shippingAddress.postalCode ?? '', undefined, true, 'text')}
            </div>
          </section>

          <section class="card" aria-labelledby="delivery-time-title">
            <h2 id="delivery-time-title">Delivery Time</h2>
            <div class="choice-group" role="radiogroup" aria-label="Delivery time">
              <label class="choice-card">
                <input type="radio" name="delivery-method" value="asap" .checked=${this.deliveryMethod === 'asap'} @change=${() => this.selectDeliveryMethod('asap')} />
                <span><strong>ASAP</strong><span class="supporting" style="display:block">25–35 minutes</span></span>
                <span class="selected-check material-symbols-outlined" aria-hidden="true">check_circle</span>
              </label>
              <label class="choice-card">
                <input type="radio" name="delivery-method" value="scheduled" .checked=${this.deliveryMethod === 'scheduled'} @change=${() => this.selectDeliveryMethod('scheduled')} />
                <span><strong>Schedule for later</strong><span class="supporting" style="display:block">Choose a future date and time</span></span>
                <span class="selected-check material-symbols-outlined" aria-hidden="true">check_circle</span>
              </label>
            </div>
            ${this.deliveryMethod === 'scheduled' ? html`
              <div class="form-grid" style="margin-top:16px">
                <div class="native-field">
                  <label for="schedule-date">Date</label>
                  <input id="schedule-date" data-field="schedule" type="date" min=${minDate} .value=${this.scheduleDate} aria-invalid=${Boolean(this.deliveryErrors.schedule)} aria-describedby=${this.deliveryErrors.schedule ? 'schedule-error' : nothing} @input=${this.onScheduleDateInput} />
                </div>
                <div class="native-field">
                  <label for="schedule-time">Time</label>
                  <select id="schedule-time" data-field="schedule" .value=${this.scheduleTime} aria-invalid=${Boolean(this.deliveryErrors.schedule)} aria-describedby=${this.deliveryErrors.schedule ? 'schedule-error' : nothing} @change=${this.onScheduleTimeInput}>
                    <option value="">Choose a time</option>
                    ${timeOptions.map((time) => html`<option value=${time}>${time}</option>`)}
                  </select>
                </div>
              </div>
              ${this.deliveryErrors.schedule ? html`<p class="error-text" id="schedule-error" role="alert">${this.deliveryErrors.schedule}</p>` : nothing}
              ${scheduledFor ? html`<p class="supporting" style="margin-top:12px">Selected: ${formatScheduledTime(scheduledFor)}</p>` : nothing}
            ` : nothing}
          </section>

          <div class="actions checkout-actions">
            <md-outlined-button @click=${() => this.requestNavigation('/cart')}>Back to Cart</md-outlined-button>
            <md-filled-button @click=${this.continueToPayment}>Continue to Payment</md-filled-button>
          </div>
          
        </div>
          ${this.renderCheckoutCompanion('delivery')}

          </div>


      </main>
    `;
  }

  private renderTextField(
    field: keyof ShippingAddress,
    label: string,
    value: string,
    error: string | undefined,
    optional: boolean,
    type: 'text' | 'tel',
  ): TemplateResult {
    const errorId = `${String(field)}-error`;
    return html`
      <div class="field-wrap">
        <md-outlined-text-field
          data-field=${String(field)}
          label=${label}
          type=${type}
          .value=${value}
          ?required=${!optional}
          aria-invalid=${Boolean(error)}
          aria-describedby=${error ? errorId : nothing}
          @input=${(event: Event) => this.onAddressInput(field, event)}>
        </md-outlined-text-field>
        ${error ? html`<p id=${errorId} class="error-text" role="alert">${error}</p>` : nothing}
      </div>
    `;
  }

  private renderPayment(): TemplateResult {
    const summary = calculateCartSummary(this.items);
    const walletInsufficient = summary.total > WALLET_BALANCE;
    return html`
      <main class="page" aria-labelledby="payment-title">
      ${this.renderStepper(3)}

<div class="checkout-shell">
  <div class="checkout-column">
          <section>
            <h1 id="payment-title">Payment</h1>
            <p class="supporting">All payment options are simulations. No real charge will be made.</p>
          </section>

          <section class="card" aria-labelledby="method-title" id="payment-methods">
            <h2 id="method-title">Payment Method</h2>
            <div class="choice-group" role="radiogroup" aria-label="Payment method">
              ${this.renderPaymentChoice('cash', 'payments', 'Cash on Delivery', 'Pay when your order arrives — demo only.')}
              ${this.renderPaymentChoice('mock-card', 'credit_card', 'Mock Credit Card', 'Demo card processing; no bank is contacted.')}
              ${this.renderPaymentChoice('mock-wallet', 'account_balance_wallet', 'Yum Wallet — Demo', `Available balance: ${formatILS(WALLET_BALANCE)}`)}
            </div>
            <div class="demo-note" style="margin-top:16px">
              <span class="material-symbols-outlined" aria-hidden="true">info</span>
              <span>This is a demo payment. No real charge will be made.</span>
            </div>

            ${this.paymentMethod === 'mock-card' ? this.renderCardFields() : nothing}
            ${this.paymentMethod === 'mock-wallet' && walletInsufficient ? html`
              <div class="wallet-warning" role="alert">
                <strong>Your wallet balance is ${formatILS(WALLET_BALANCE)}, but this order costs ${formatILS(summary.total)}.</strong>
                <div style="margin-top:8px"><md-text-button @click=${this.focusPaymentMethods}>Choose another payment method</md-text-button></div>
              </div>
            ` : nothing}
          </section>

          ${this.paymentFailure ? this.renderPaymentFailure(summary.total) : nothing}
          ${this.renderFinalReview(summary)}

          ${this.processing ? html`
            <div class="processing" role="status" aria-live="polite">
              <span class="material-symbols-outlined" aria-hidden="true">restaurant</span>
              <span>Sending your order to the kitchen…</span>
              <md-linear-progress indeterminate aria-label="Sending order"></md-linear-progress>
            </div>
          ` : nothing}

          <md-filled-button
            class="place-order"
            ?disabled=${this.processing || (this.paymentMethod === 'mock-wallet' && walletInsufficient)}
            @click=${this.placeOrder}>
            Place Order
          </md-filled-button>
            </div>
        ${this.renderCheckoutCompanion('payment')}

        </div>
        

      </main>

    `;
  }

  private renderPaymentChoice(method: PaymentMethod, icon: string, label: string, supporting: string): TemplateResult {
    return html`
      <label class="choice-card">
        <input type="radio" name="payment-method" .value=${method} .checked=${this.paymentMethod === method} @change=${() => this.selectPaymentMethod(method)} />
        <span>
          <strong><span class="material-symbols-outlined" aria-hidden="true" style="vertical-align:-5px;margin-right:8px">${icon}</span>${label}</strong>
          <span class="supporting" style="display:block">${supporting}</span>
        </span>
        <span class="selected-check material-symbols-outlined" aria-hidden="true">check_circle</span>
      </label>
    `;
  }

private renderCardFields(): TemplateResult {
  return html`
    <div class="card-fields">

      <div
        class="demo-credit-card"
        aria-label="Demo credit card preview">

        <div class="demo-card-top">
          <div class="demo-card-brand">
            <span class="material-symbols-outlined" aria-hidden="true">
              restaurant
            </span>
            <span>Yum Ta Dum</span>
          </div>

          <span class="demo-card-badge">DEMO</span>
        </div>

        <div class="demo-card-chip" aria-hidden="true"></div>

        <div class="demo-card-number">
          ${this.cardPreviewNumber()}
        </div>

        <div class="demo-card-bottom">
          <div>
            <span class="demo-card-label">CARDHOLDER</span>
            <strong>${this.cardPreviewName()}</strong>
          </div>

          <div>
            <span class="demo-card-label">EXPIRES</span>
            <strong>${this.cardDetails.expiry || 'MM/YY'}</strong>
          </div>
        </div>
      </div>

      <p class="supporting card-simulation-copy">
        This is a demo card. No real payment or bank connection is used.
      </p>

      ${this.renderCardField(
        'cardholderName',
        'Cardholder Name',
        this.cardDetails.cardholderName,
        this.cardErrors.cardholderName,
        'text',
        'name'
      )}

      ${this.renderCardField(
        'cardNumber',
        'Card Number',
        this.cardDetails.cardNumber,
        this.cardErrors.cardNumber,
        'text',
        'cc-number'
      )}

      <div class="card-fields-row">
        ${this.renderCardField(
          'expiry',
          'Expiry MM/YY',
          this.cardDetails.expiry,
          this.cardErrors.expiry,
          'text',
          'cc-exp'
        )}

        ${this.renderCardField(
          'cvv',
          'CVV',
          this.cardDetails.cvv,
          this.cardErrors.cvv,
          'password',
          'cc-csc'
        )}
      </div>

      <div class="demo-note">
        <span
          class="material-symbols-outlined"
          aria-hidden="true">
          science
        </span>

        <span>
          Test success: ${this.groupCard(SUCCESS_CARD)}
          ·
          Test decline: ${this.groupCard(DECLINE_CARD)}
        </span>
      </div>
    </div>
  `;
}

  private renderCardField(
    field: keyof CardDetails,
    label: string,
    value: string,
    error: string | undefined,
    type: 'text' | 'password',
    autocomplete: string,
  ): TemplateResult {
    const errorId = `card-${field}-error`;
    return html`
      <div class="field-wrap">
        <md-outlined-text-field
          data-card-field=${field}
          label=${label}
          type=${type}
          autocomplete=${autocomplete}
          .value=${value}
          aria-invalid=${Boolean(error)}
          aria-describedby=${error ? errorId : nothing}
          @input=${(event: Event) => this.onCardInput(field, event)}>
        </md-outlined-text-field>
        ${error ? html`<p id=${errorId} class="error-text" role="alert">${error}</p>` : nothing}
      </div>
    `;
  }

  private renderFinalReview(summary = calculateCartSummary(this.items)): TemplateResult {
    const scheduledFor = toLocalIso(this.scheduleDate, this.scheduleTime);
    const deliveryCopy = this.deliveryMethod === 'asap'
      ? 'ASAP · 25–35 minutes'
      : scheduledFor ? `Scheduled · ${formatScheduledTime(scheduledFor)}` : 'Scheduled time not selected';
    return html`
      <section class="card" aria-labelledby="review-title">
        <h2 id="review-title">Order Review</h2>
        <div class="review-list">
          ${this.items.map((item) => html`
            <div class="review-item">
              <span>${item.quantity}× ${item.name}</span>
              <strong>${formatILS(item.quantity * item.price)}</strong>
            </div>
          `)}
        </div>
        <div class="review-detail">
          <div><strong>Restaurant</strong><span class="supporting">${this.items[0]?.restaurantName}</span></div>
        </div>
        <div class="review-detail">
          <div><strong>Deliver to</strong><span class="supporting">${formatAddress(this.shippingAddress) || 'Delivery address required'}</span></div>
          <md-text-button @click=${() => this.requestNavigation('/checkout/delivery')}>Edit</md-text-button>
        </div>
        <div class="review-detail">
          <div><strong>Delivery</strong><span class="supporting">${deliveryCopy}</span></div>
          <md-text-button @click=${() => this.requestNavigation('/checkout/delivery')}>Edit</md-text-button>
        </div>
        <div class="review-detail">
          <div><strong>Payment</strong><span class="supporting">${paymentMethodLabel(this.paymentMethod)} · Demo</span></div>
          <md-text-button @click=${this.focusPaymentMethods}>Edit</md-text-button>
        </div>
        <md-divider></md-divider>
        <div class="summary-row"><span>Subtotal</span><span>${formatILS(summary.subtotal)}</span></div>
        <div class="summary-row"><span>Discount</span><span>${formatILS(summary.discount)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${summary.deliveryFee === 0 ? 'Free' : formatILS(summary.deliveryFee)}</span></div>
        <div class="summary-row summary-total"><span>Total</span><span>${formatILS(summary.total)}</span></div>
      </section>
    `;
  }

  private renderPaymentFailure(total: number): TemplateResult {
    return html`
      <section class="card payment-failure" role="alert" aria-labelledby="payment-failure-title">
        <h2 id="payment-failure-title">Payment could not be completed.</h2>
        <p>Please check your card details or choose another payment method.</p>
        <p class="supporting">Your order total (${formatILS(total)}) and cart are unchanged.</p>
        <div class="actions">
          <md-filled-button @click=${this.tryPaymentAgain}>Try Again</md-filled-button>
          <md-outlined-button @click=${this.focusPaymentMethods}>Change Payment Method</md-outlined-button>
        </div>
      </section>
    `;
  }

  private renderConfirmation(): TemplateResult {
    if (!this.completedOrder) {
      return html`
        <main class="page empty" aria-labelledby="confirmation-unavailable-title">
          <div class="empty-inner">
<img
  class="status-mascot status-mascot--session"
  src=${yumyNoCompletedOrder}
  alt=""
  aria-hidden="true"
/>            <h1 id="confirmation-unavailable-title">No completed order in this session</h1>
            <p class="supporting">Order details are handed to Account & Orders through the public event contract and are not stored here.</p>
            <md-filled-button @click=${() => this.requestNavigation('/restaurants')}>Explore More Meals</md-filled-button>
          </div>
        </main>
      `;
    }
    const order = this.completedOrder;
    const deliveryCopy = order.deliveryMethod === 'asap'
      ? 'ASAP · 25–35 minutes'
      : order.scheduledFor ? `Scheduled · ${formatScheduledTime(order.scheduledFor)}` : 'Scheduled';
    return html`
    <main class="page" aria-labelledby="confirmation-title">
  ${this.renderStepper(4)}

  <div class="checkout-shell checkout-shell--confirmation">
    <section class="confirmation">
      <img
        class="status-mascot status-mascot--session"
        src=${yumyOrderConfirmed}
        alt=""
        aria-hidden="true"
      />
          <h1 id="confirmation-title">Order Confirmed</h1>
          <p>Your food is being prepared.</p>

          <div class="card confirmation-card">
            <div class="review-detail"><div><strong>Order ID</strong><span class="supporting">${order.orderId}</span></div></div>
            <div class="review-detail"><div><strong>Restaurant</strong><span class="supporting">${order.restaurantName}</span></div></div>
            <div class="review-list">
              ${order.items.map((item) => html`<div class="review-item"><span>${item.quantity}× ${item.name}</span><strong>${formatILS(item.quantity * item.price)}</strong></div>`)}
            </div>
            <div class="review-detail"><div><strong>Delivery</strong><span class="supporting">${deliveryCopy}</span></div></div>
            <div class="review-detail"><div><strong>Address</strong><span class="supporting">${formatAddress(order.shippingAddress)}</span></div></div>
            <div class="review-detail"><div><strong>Payment</strong><span class="supporting">${paymentMethodLabel(order.paymentMethod)} · Demo</span></div></div>
            <div class="summary-row summary-total"><span>Total</span><strong>${formatILS(order.total)}</strong></div>
          </div>
          <div class="actions confirmation-actions">
            <md-filled-button @click=${() => this.requestNavigation('/orders')}>View Orders</md-filled-button>
            <md-outlined-button @click=${() => this.requestNavigation('/restaurants')}>Explore More Meals</md-outlined-button>
          </div>
          
        </section>
            ${this.renderCheckoutCompanion('confirmation')}
  </div>
      </main>
    `;
  }

 private renderConflictDialog(): TemplateResult {
  return html`
    <md-dialog
      ?open=${Boolean(this.pendingConflictItem)}
      @closed=${this.onConflictDialogClosed}>

      <div slot="headline">One order, one kitchen</div>

      <div slot="content">
        <img
          class="dialog-mascot"
          src=${yumyRestaurantConflict}
          alt=""
          aria-hidden="true"
        />

        <p>Your cart contains items from another restaurant.</p>
        <p>Clear the current cart and add this item?</p>
      </div>

      <div slot="actions">
        <md-text-button autofocus @click=${this.keepCurrentCart}>
          Keep current cart
        </md-text-button>

        <md-filled-button @click=${this.clearAndAddPending}>
          Clear and add
        </md-filled-button>
      </div>
    </md-dialog>
  `;
}

  private renderSnackbar(): TemplateResult | typeof nothing {
    if (!this.snackbarMessage) return nothing;
    return html`
      <div class="snackbar" role="status" aria-live="polite">
        <span>${this.snackbarMessage}</span>
        ${this.removedSnapshot ? html`<button type="button" @click=${this.undoRemoval}>Undo</button>` : nothing}
      </div>
    `;
  }

  private getStorage(): StorageLike | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  private applyCart(nextItems: MealItem[]): void {
    this.items = nextItems.map((item) => ({ ...item }));
    const result = saveCart(this.getStorage(), this.items);
    this.storageWarning = result.failed;
    dispatchCartUpdated(this, calculateCartSummary(this.items));
  }

  private changeQuantity(item: MealItem, requested: number): void {
    if (requested > MAX_QUANTITY) {
      this.showSnackbar("You've reached the maximum quantity (10).");
      return;
    }
    if (requested < 1) return;
    const result = setQuantity(this.items, item.id, requested);
    this.applyCart(result.items);
    if (result.capped) this.showSnackbar("You've reached the maximum quantity (10).");
  }

  private removeCartItem(itemId: string): void {
    const result = removeItem(this.items, itemId);
    if (!result.removed) return;
    this.removedSnapshot = result.removed;
    this.applyCart(result.items);
    this.showSnackbar(`${result.removed.item.name} removed.`, true);
  }

  private readonly undoRemoval = (): void => {
    if (!this.removedSnapshot) return;
    this.items = restoreRemovedItem(this.items, this.removedSnapshot);
    this.applyCart(this.items);
    this.removedSnapshot = null;
    this.dismissSnackbar();
  };

  private showSnackbar(message: string, preserveUndo = false): void {
    if (this.snackbarTimer) clearTimeout(this.snackbarTimer);
    if (!preserveUndo) this.removedSnapshot = null;
    this.snackbarMessage = message;
    this.snackbarTimer = setTimeout(() => {
      this.snackbarMessage = '';
      this.removedSnapshot = null;
      this.snackbarTimer = null;
    }, 6000);
  }

  private dismissSnackbar(): void {
    if (this.snackbarTimer) clearTimeout(this.snackbarTimer);
    this.snackbarTimer = null;
    this.snackbarMessage = '';
  }

  private readonly keepCurrentCart = (): void => {
    this.pendingConflictItem = null;
  };

  private readonly clearAndAddPending = (): void => {
    if (!this.pendingConflictItem) return;
    const result = addOrIncrement([], this.pendingConflictItem);
    this.pendingConflictItem = null;
    this.applyCart(result.items);
    if (result.capped) this.showSnackbar("You've reached the maximum quantity (10).");
  };

  private readonly onConflictDialogClosed = (): void => {
    if (this.pendingConflictItem) this.pendingConflictItem = null;
  };

  private readonly proceedToDelivery = (): void => {
    if (this.items.length > 0) this.requestNavigation('/checkout/delivery');
  };

  private requestNavigation(route: string): void {
    dispatchNavigationRequested(this, route);
  }

  private chooseRecipientMode(mode: RecipientMode): void {
    this.recipientMode = mode;
    this.shippingAddress = cloneAddress(mode === 'saved' ? SAVED_ADDRESS : EMPTY_ADDRESS);
    this.deliveryErrors = {};
  }

  private updateAddress(field: keyof ShippingAddress, value: string): void {
    this.shippingAddress = { ...this.shippingAddress, [field]: value };
    if (field === 'fullName' || field === 'phone' || field === 'city' || field === 'streetAddress') {
      this.deliveryErrors = { ...this.deliveryErrors, [field]: undefined };
    }
  }

  private onAddressInput(field: keyof ShippingAddress, event: Event): void {
    const value = (event.currentTarget as HTMLElement & { value: string }).value;
    this.updateAddress(field, value);
  }

  private selectDeliveryMethod(method: DeliveryMethod): void {
    this.deliveryMethod = method;
    this.deliveryErrors = { ...this.deliveryErrors, schedule: undefined };
    if (method === 'asap') {
      this.scheduleDate = '';
      this.scheduleTime = '';
    }
  }

  private readonly onScheduleDateInput = (event: Event): void => {
    const value = (event.currentTarget as HTMLInputElement).value;
    this.scheduleDate = value;
    const options = buildTimeOptions(value);
    if (!options.includes(this.scheduleTime)) this.scheduleTime = '';
    this.deliveryErrors = { ...this.deliveryErrors, schedule: undefined };
  };

  private readonly onScheduleTimeInput = (event: Event): void => {
    this.scheduleTime = (event.currentTarget as HTMLSelectElement).value;
    this.deliveryErrors = { ...this.deliveryErrors, schedule: undefined };
  };

  private readonly continueToPayment = (): void => {
    const scheduledFor = this.deliveryMethod === 'scheduled' ? toLocalIso(this.scheduleDate, this.scheduleTime) : null;
    const errors = validateDelivery(this.shippingAddress, this.deliveryMethod, scheduledFor);
    this.deliveryErrors = errors;
    const firstError = ['fullName', 'phone', 'city', 'streetAddress', 'schedule'].find((field) => Boolean(errors[field as keyof DeliveryErrors]));
    if (firstError) {
      this.updateComplete.then(() => this.focusSelector(`[data-field="${firstError}"]`));
      return;
    }
    this.requestNavigation('/checkout/payment');
  };

  private selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod = method;
    this.paymentFailure = false;
    this.cardErrors = {};
    if (method !== 'mock-card') this.clearSensitiveCardState(false);
  }

  private onCardInput(field: keyof CardDetails, event: Event): void {
    let value = (event.currentTarget as HTMLInputElement & { value: string }).value;
    if (field === 'cardNumber') {
      value = normalizeCardNumber(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    this.cardDetails = { ...this.cardDetails, [field]: value };
    if (this.cardErrors[field]) this.cardErrors = { ...this.cardErrors, [field]: undefined };
  }

  private clearSensitiveCardState(keepMethod: boolean): void {
    this.cardDetails = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' };
    this.cardErrors = {};
    if (!keepMethod && this.paymentMethod === 'mock-card') this.paymentMethod = 'cash';
  }

  private readonly focusPaymentMethods = (): void => {
    this.paymentFailure = false;
    this.updateComplete.then(() => {
      const first = this.renderRoot.querySelector<HTMLInputElement>('#payment-methods input[name="payment-method"]');
      first?.focus();
      this.renderRoot.querySelector('#payment-methods')?.scrollIntoView({ behavior: this.prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    });
  };

  private readonly tryPaymentAgain = (): void => {
    this.paymentFailure = false;
    this.updateComplete.then(() => {
      const button = this.renderRoot.querySelector<HTMLElement>('.place-order');
      button?.focus();
    });
  };

  private readonly placeOrder = async (): Promise<void> => {
    if (!this.submissionGate.begin()) return;
    if (this.processing) {
      this.submissionGate.end();
      return;
    }

    const scheduledFor = this.deliveryMethod === 'scheduled' ? toLocalIso(this.scheduleDate, this.scheduleTime) : null;
    const deliveryErrors = validateDelivery(this.shippingAddress, this.deliveryMethod, scheduledFor);
    if (Object.values(deliveryErrors).some(Boolean) || this.items.length === 0) {
      this.deliveryErrors = deliveryErrors;
      this.submissionGate.end();
      this.requestNavigation('/checkout/delivery');
      return;
    }

    if (this.paymentMethod === 'mock-card') {
      const errors = validateCardDetails(this.cardDetails);
      if (Object.keys(errors).length > 0) {
        this.cardErrors = errors;
        this.submissionGate.end();
        const first = ['cardholderName', 'cardNumber', 'expiry', 'cvv'].find((field) => Boolean(errors[field as keyof CardValidationErrors]));
        if (first) this.updateComplete.then(() => this.focusSelector(`[data-card-field="${first}"]`));
        return;
      }
    }

    const summary = calculateCartSummary(this.items);
    if (this.paymentMethod === 'mock-wallet' && summary.total > WALLET_BALANCE) {
      this.submissionGate.end();
      this.focusPaymentMethods();
      return;
    }

    this.processing = true;
    this.paymentFailure = false;
    const startedAt = performance.now();
    const result = this.paymentMethod === 'mock-card' ? evaluateMockCard(this.cardDetails) : 'success';
    const elapsed = performance.now() - startedAt;
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 600 - elapsed)));

    if (result === 'decline') {
      this.processing = false;
      this.paymentFailure = true;
      this.submissionGate.end();
      return;
    }

    if (result === 'invalid') {
      this.processing = false;
      this.cardErrors = validateCardDetails(this.cardDetails);
      this.submissionGate.end();
      return;
    }

    const order = buildCompletedOrder({
      items: this.items,
      shippingAddress: this.shippingAddress,
      deliveryMethod: this.deliveryMethod,
      scheduledFor,
      paymentMethod: this.paymentMethod,
      userId: null,
    });

    const handoff = completeOrderHandoff(this, order, this.getStorage(), () => { this.items = []; });
    this.storageWarning = handoff.storageFailed;
    this.completedOrder = order;
    this.processing = false;
    this.paymentFailure = false;
    this.clearSensitiveCardState(true);
    this.submissionGate.end();
    this.requestNavigation('/order-confirmation');
  };

  private focusSelector(selector: string): void {
    const element = this.renderRoot.querySelector<HTMLElement>(selector);
    element?.focus();
    element?.scrollIntoView({ behavior: this.prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }

  private cardPreviewNumber(): string {
  const normalized = normalizeCardNumber(this.cardDetails.cardNumber);

  if (!normalized) {
    return '•••• •••• •••• ••••';
  }

  const padded = normalized.padEnd(16, '•');

  return padded
    .match(/.{1,4}/g)
    ?.join(' ') ?? '•••• •••• •••• ••••';
}
private cardPreviewName(): string {
  return this.cardDetails.cardholderName.trim()
    ? this.cardDetails.cardholderName.toUpperCase()
    : 'CARDHOLDER NAME';
}
  private groupCard(card: string): string {
    return card.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yum-cart-checkout': YumCartCheckout;
  }
}
