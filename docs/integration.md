# Shell Integration Guide

`<yum-cart-checkout>` is an independently built Web Component. The future Yum Ta Dum Shell should load the deployed ES-module bundle, render the custom element when a Cart/Checkout route is active, and coordinate it only through the public event contracts.

## 1. Load the deployed bundle

```html
<script
  type="module"
  src="https://CART-CHECKOUT-DEPLOYMENT.vercel.app/mfe/yum-cart-checkout.js">
</script>
```

Then render:

```html
<yum-cart-checkout></yum-cart-checkout>
```

The Shell must not copy this repository's source code into the Shell repository.

## 2. Route ownership

The Shell owns global route selection. It should make the Cart & Checkout MFE visible for:

```text
/cart
/checkout/delivery
/checkout/payment
/order-confirmation
```

The MFE requests navigation rather than calling `location.href`.

```ts
document.addEventListener('navigation:requested', (event) => {
  const { route } = (event as CustomEvent<{ route: string }>).detail;
  // Shell router decides how to activate the requested global route.
  shellRouter.navigate(route);
});
```

A simple History API shell may update history and notify route observers:

```ts
document.addEventListener('navigation:requested', (event) => {
  const { route } = (event as CustomEvent<{ route: string }>).detail;
  history.pushState({}, '', route);
  window.dispatchEvent(new PopStateEvent('popstate'));
});
```

The second example is only one host implementation; the public contract is the event itself.

## 3. Catalog → Cart

Catalog sends an exact `MealItem` at application/window level:

```ts
window.dispatchEvent(new CustomEvent('cart:add-item', {
  detail: {
    item: {
      id: 'meal-101',
      restaurantId: 'rest-01',
      restaurantName: 'Burger House',
      name: 'Classic Cheeseburger',
      description: 'Beef patty, cheddar, lettuce, tomato, pickles, and house sauce in a toasted bun.',
      price: 35,
      image: 'https://…',
      category: 'Burgers',
      quantity: 1,
    },
  },
  bubbles: true,
  composed: true,
}));
```

Cart & Checkout owns cart mutation/persistence after this handoff. Catalog must not modify Cart's private state.

## 4. Cart → Shell badge

The Shell listens for `cart:updated`:

```ts
document.addEventListener('cart:updated', (event) => {
  const detail = (event as CustomEvent<{
    itemCount: number;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    restaurantId: string | null;
    currency: 'ILS';
  }>).detail;

  updateGlobalCartBadge(detail.itemCount);
});
```

The MFE emits a current summary after restoration, so the Shell can synchronize its badge even before the user mutates the cart in the current page session.

## 5. Checkout → Account & Orders

On successful simulated payment, Cart & Checkout dispatches `order:completed` **before** it clears the cart:

```ts
document.addEventListener('order:completed', (event) => {
  const { order } = (event as CustomEvent<{ order: CompletedOrder }>).detail;
  accountOrdersElement.acceptCompletedOrder(order); // conceptual host/consumer action
});
```

In the actual team architecture, Account & Orders should own storage under its agreed order key. Cart & Checkout deliberately does not duplicate that persistence responsibility.

The success ordering is:

```text
order:completed
→ clear in-memory cart
→ persist yum-ta-dum-cart as []
→ empty cart:updated
→ navigation:requested('/order-confirmation')
```

## 6. Event propagation across Shadow DOM

All public Custom Events use both:

```ts
bubbles: true
composed: true
```

This is necessary so a Shell outside the Lit component's Shadow DOM can receive the events through normal DOM event propagation.

## 7. Development demo

After both builds:

```bash
npm run build
npm run build:mfe
npm run preview
```

Open `/mfe-demo.html`. It loads the **actual production library bundle** from `/mfe/yum-cart-checkout.js`, renders `<yum-cart-checkout>`, and provides development-only Catalog fixture buttons outside the component.

## 8. Shell-owned UI boundaries

The Shell, not this MFE, owns:

- Yum Ta Dum global logo
- Header and global navigation
- Footer
- Global cart badge
- Global notifications
- Remote loading/fallback states

The MFE owns its local Undo snackbar and checkout-specific validation/payment states because those are internal interaction details, not global Shell notifications.
