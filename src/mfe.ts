import { YumCartCheckout } from './yum-cart-checkout';

if (!customElements.get('yum-cart-checkout')) {
  customElements.define('yum-cart-checkout', YumCartCheckout);
}
