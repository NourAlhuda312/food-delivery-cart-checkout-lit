import { LitElement, css, html, type CSSResultGroup } from 'lit';
import './mfe';
import { DEMO_ITEMS } from './fixtures/demo-items';
import {
  EVENT_CART_ADD_ITEM,
  EVENT_NAVIGATION_REQUESTED,
  createPublicEvent,
} from './events/public-events';
import type { NavigationRequestedDetail } from './contracts';

class YumCartStandalone extends LitElement {
  static styles: CSSResultGroup = css`
    :host { display:block; min-height:100vh; background:#eef2ec; color:#1f1f1f; font-family:Roboto,Arial,sans-serif; }
    .tools { position:sticky; top:0; z-index:50; display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:12px 16px; background:#fff; border-bottom:1px solid #e0e0e0; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .tools strong { margin-right:8px; }
    button { min-height:44px; padding:8px 12px; border:1px solid #2e7d32; border-radius:12px; background:#fff; color:#1f1f1f; font:600 14px Roboto,Arial,sans-serif; cursor:pointer; }
    button:focus-visible { outline:2px solid #2e7d32; outline-offset:2px; }
    .route { margin-left:auto; font-size:14px; color:#616161; }
    @media(max-width:599px){ .route{width:100%;margin-left:0} }
  `;

  private route = location.pathname;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(EVENT_NAVIGATION_REQUESTED, this.handleNavigation as EventListener);
    window.addEventListener('popstate', this.handlePopState);
    if (!['/cart','/checkout/delivery','/checkout/payment','/order-confirmation'].includes(location.pathname)) this.navigate('/cart');
  }

  disconnectedCallback(): void {
    this.removeEventListener(EVENT_NAVIGATION_REQUESTED, this.handleNavigation as EventListener);
    window.removeEventListener('popstate', this.handlePopState);
    super.disconnectedCallback();
  }

  protected render() {
    return html`
      <div class="tools" aria-label="Development-only standalone controls">
        <strong>Standalone MFE development host</strong>
        <button @click=${() => this.addFixture(0)}>Add Cheeseburger</button>
        <button @click=${() => this.addFixture(1)}>Add Fries</button>
        <button @click=${() => this.addFixture(2)}>Add Musakhan (conflict)</button>
        <button @click=${() => this.navigate('/cart')}>/cart</button>
        <button @click=${() => this.navigate('/checkout/delivery')}>/checkout/delivery</button>
        <button @click=${() => this.navigate('/checkout/payment')}>/checkout/payment</button>
        <span class="route">Current route: ${this.route}</span>
      </div>
      <yum-cart-checkout></yum-cart-checkout>
    `;
  }

  private addFixture(index: number): void {
    const item = DEMO_ITEMS[index];
    window.dispatchEvent(createPublicEvent(EVENT_CART_ADD_ITEM, { item: { ...item } }));
  }

  private readonly handleNavigation = (event: CustomEvent<NavigationRequestedDetail>): void => {
    event.stopPropagation();
    this.navigate(event.detail.route);
  };

  private readonly handlePopState = (): void => {
    this.route = location.pathname;
    this.requestUpdate();
  };

  private navigate(route: string): void {
    history.pushState({}, '', route);
    this.route = route;
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

if (!customElements.get('yum-cart-standalone')) {
  customElements.define('yum-cart-standalone', YumCartStandalone);
}
