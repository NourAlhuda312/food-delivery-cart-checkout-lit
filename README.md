# 🍲 Yum Ta Dum — Cart & Checkout Microfrontend

**Group 13 · Component-Based Software Engineering**

**Good food. Good mood. Yum Ta Dum.**

This repository contains the **Cart & Checkout Microfrontend** for the Yum Ta Dum multi-vendor food delivery platform.

It is built as an independently deployable **Lit + Material Web** Web Component and integrated into the final Yum Ta Dum Shell through **Web Components + DOM Custom Events**.

> This repository contains only the Cart & Checkout Microfrontend.  
> It does not contain the Shell, Catalog, or Account & Orders source code.

---

## Live Links

| Resource | URL |
|---|---|
| Standalone Cart App | https://yum-ta-dum-cart.vercel.app/cart |
| MFE Bundle | https://yum-ta-dum-cart.vercel.app/mfe/yum-cart-checkout.js |
| GitHub Repository | https://github.com/NourAlhuda312/food-delivery-cart-checkout-lit |
| Integrated Shell Demo | https://yum-ta-dum-shell.vercel.app/ |

---

## Microfrontend Identity

| Field | Value |
|---|---|
| Project | Yum Ta Dum |
| Feature Area | Cart & Checkout |
| Owner | Nour Al-Huda |
| Framework | Lit |
| UI Library | Material Web |
| Custom Element | `<yum-cart-checkout>` |
| Architecture Role | Independent Cart & Checkout MFE |
| Persistence | Browser `localStorage` |
| Currency | ILS / ₪ |

---

## Architecture Role

The Cart & Checkout Microfrontend is responsible for the shopping cart, checkout flow, payment simulation, and order completion event.

```text
Catalog & Discovery
        |
        | cart:add-item
        v
Cart & Checkout
        |
        | cart:updated
        v
Yum Ta Dum Shell cart badge

Cart & Checkout
        |
        | order:completed
        v
Account & Orders
```

The Cart component is loaded by the Shell as a deployed JavaScript bundle. The Shell does not copy or import the internal source code of this repository.

---

## Shell Integration

The Shell can load this Microfrontend using the public ES module bundle:

```html
<script
  type="module"
  src="https://yum-ta-dum-cart.vercel.app/mfe/yum-cart-checkout.js">
</script>

<yum-cart-checkout></yum-cart-checkout>
```

The custom element name must remain:

```html
<yum-cart-checkout></yum-cart-checkout>
```

---

## Main Features

- Add meals to cart from Catalog events
- Update meal quantity
- Remove cart items
- Undo deleted item
- Persist cart state in `localStorage`
- Enforce one-restaurant-per-order rule
- Handle restaurant conflict safely
- Display cart item totals
- Display order summary
- Free-delivery progress indicator
- Guest checkout flow
- Delivery address form
- ASAP or scheduled delivery option
- Mock payment methods
- Final order review
- Simulated order processing
- Order confirmation state
- Dispatch completed order to Account & Orders
- Responsive desktop and mobile layout
- Accessible buttons, forms, and states

---

## Business Rules

| Rule | Description |
|---|---|
| One restaurant per order | The cart prevents mixing meals from different restaurants in one order. |
| Conflict confirmation | If the user adds a meal from another restaurant, the cart asks before clearing the current cart. |
| Quantity limits | Item quantities are controlled to prevent invalid cart states. |
| Frontend-only checkout | No real backend, bank, or payment provider is contacted. |
| Numeric money values | Event payloads use numeric values, not formatted strings. |
| Currency | Prices are displayed using ILS / ₪. |

---

## Custom Event Contracts

All shared events use:

```js
{
  bubbles: true,
  composed: true
}
```

---

### Consumed Event: `cart:add-item`

Produced by:

```text
Catalog & Discovery
```

Consumed by:

```text
Cart & Checkout
```

Payload:

```ts
{
  item: {
    id: string;
    restaurantId: string;
    restaurantName: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
  }
}
```

---

### Produced Event: `cart:updated`

Produced by:

```text
Cart & Checkout
```

Consumed by:

```text
Yum Ta Dum Shell
```

Purpose:

```text
Update the global cart badge and cart summary state.
```

Payload:

```ts
{
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  restaurantId: string | null;
  currency: 'ILS';
}
```

---

### Produced Event: `order:completed`

Produced by:

```text
Cart & Checkout
```

Consumed by:

```text
Account & Orders
Yum Ta Dum Shell
```

Purpose:

```text
Record the completed mock order and show global success feedback.
```

Payload:

```ts
{
  order: CompletedOrder;
}
```

---

### Produced Event: `navigation:requested`

Produced by:

```text
Cart & Checkout
```

Consumed by:

```text
Yum Ta Dum Shell
```

Purpose:

```text
Request route changes without forcing a full page reload.
```

Payload:

```ts
{
  route: string;
}
```

Example:

```js
this.dispatchEvent(
  new CustomEvent('navigation:requested', {
    detail: {
      route: '/checkout/delivery'
    },
    bubbles: true,
    composed: true
  })
);
```

---

## localStorage

The cart persists frontend state using:

```text
yum-ta-dum-cart
```

The storage is intentionally local to the browser because this project is a frontend-only university simulation.

---

## Routes Owned by Cart & Checkout

The Shell owns global routing, but this Microfrontend handles the cart/checkout screens for these routes:

```text
/cart
/checkout/delivery
/checkout/payment
/order-confirmation
```

---

## Development Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Type check:

```bash
npm run typecheck
```

Build standalone app:

```bash
npm run build
```

Build Microfrontend bundle:

```bash
npm run build:mfe
```

---

## Build Outputs

Standalone app:

```text
dist/
```

Microfrontend bundle:

```text
dist/mfe/yum-cart-checkout.js
```

Production bundle URL:

```text
https://yum-ta-dum-cart.vercel.app/mfe/yum-cart-checkout.js
```

---

## Testing Checklist

| Test | Status |
|---|---|
| Standalone app runs | ✅ |
| Production build passes | ✅ |
| MFE bundle builds | ✅ |
| Shell can load `<yum-cart-checkout>` | ✅ |
| Receives `cart:add-item` | ✅ |
| Emits `cart:updated` | ✅ |
| Emits `order:completed` | ✅ |
| Emits `navigation:requested` | ✅ |
| Cart persists after refresh | ✅ |
| Restaurant conflict handled safely | ✅ |
| Checkout flow works | ✅ |
| Responsive layout tested | ✅ |
| Integrated Shell demo tested | ✅ |

---

## Integration Challenge Solved

During integration, the cart needed to work correctly even when it was mounted but hidden by the Shell router.

One important case was the **restaurant conflict rule**. When a user adds an item from a different restaurant while browsing Catalog, the Cart receives the event even if the Cart page is not currently visible.

The fix ensures that the Cart requests navigation to `/cart` before showing the restaurant-conflict confirmation dialog. This prevents the user from getting stuck on the Catalog page and keeps the rule visible and understandable.

---

## Accessibility Notes

The Cart & Checkout Microfrontend includes:

- visible form labels
- keyboard-accessible actions
- responsive layout
- meaningful empty and success states
- accessible checkout steps
- clear validation messages
- touch-friendly controls
- reduced dependency on color-only feedback

---

## Known Limitations

This is a frontend-only course project. Version 1 does not include:

- backend API
- production database
- real payment gateway
- real authentication
- real wallet balance
- real delivery provider
- real-time courier tracking
- production security or fraud checks

All payment and order behavior is simulated for demonstration purposes.

---

## AI Usage

AI tools were used as development support for:

- reviewing integration contracts
- debugging Web Component integration
- improving event flow reliability
- organizing README documentation
- checking project submission readiness

The implementation was reviewed, tested, and approved by the team.

---

## Final Demo Flow

The expected integrated demo flow is:

```text
1. Open the Yum Ta Dum Shell
2. Browse restaurants in Catalog
3. Add a meal to cart
4. Shell cart badge updates
5. Open Cart
6. Complete checkout
7. Place mock order
8. Account & Orders receives the completed order
9. Order appears in order history
```

---

## Author

**Nour Al-Huda**  
Cart & Checkout Microfrontend Owner  
Group 13 — CBSE Microfrontend E-commerce Project

---

## Yum Ta Dum

**Good food. Good mood. Yum Ta Dum.**
