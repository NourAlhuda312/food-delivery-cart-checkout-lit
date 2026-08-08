# Yum Ta Dum Cart & Checkout — Public Contracts

These contracts are the integration boundary for `<yum-cart-checkout>`. Field names, event names, data types, currency, and routes are case-sensitive public interfaces.

## Custom element

```html
<yum-cart-checkout></yum-cart-checkout>
```

Lit's normal **open Shadow DOM** is used. Registration is guarded:

```ts
if (!customElements.get('yum-cart-checkout')) {
  customElements.define('yum-cart-checkout', YumCartCheckout);
}
```

## TypeScript data contracts

```ts
export interface MealItem {
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

export interface ShippingAddress {
  label: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  city: string;
  area?: string;
  streetAddress: string;
  building?: string;
  postalCode?: string;
}

export interface CompletedOrder {
  orderId: string;
  userId: string | null;
  restaurantId: string;
  restaurantName: string;
  items: MealItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: 'asap' | 'scheduled';
  scheduledFor: string | null;
  estimatedDeliveryMinutes: number | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  currency: 'ILS';
  paymentMethod: 'cash' | 'mock-card' | 'mock-wallet';
  status:
    | 'confirmed'
    | 'preparing'
    | 'out-for-delivery'
    | 'delivered'
    | 'cancelled';
  createdAt: string;
}
```

`streetAddress` is the public field. Do not replace it with `street`.

## Event constants

```ts
EVENT_CART_ADD_ITEM = 'cart:add-item'
EVENT_CART_UPDATED = 'cart:updated'
EVENT_ORDER_COMPLETED = 'order:completed'
EVENT_NAVIGATION_REQUESTED = 'navigation:requested'
```

Every public event is constructed with:

```ts
{ bubbles: true, composed: true }
```

## Consumed — `cart:add-item`

Producer: Catalog & Discovery.
Consumer: Cart & Checkout.

```ts
{
  item: MealItem
}
```

Catalog currently dispatches this at application/window level, so `<yum-cart-checkout>` listens on `window` while connected and removes its listener when disconnected.

## Produced — `cart:updated`

Producer: Cart & Checkout.
Primary consumer: Shell.

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

`itemCount` is the total quantity across rows. The component emits this after initial restoration and after add, increment, decrement, remove, Undo, restaurant **Clear and add**, and successful order cart clearing.

Empty summary:

```ts
{
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  total: 0,
  restaurantId: null,
  currency: 'ILS'
}
```

## Produced — `order:completed`

Producer: Cart & Checkout.
Consumer: Account & Orders and Shell.

```ts
{
  order: CompletedOrder
}
```

Cart & Checkout does not persist this order to `yum-ta-dum-orders`.

## Produced — `navigation:requested`

Producer: any Microfrontend.
Consumer: Shell.

```ts
{
  route: string
}
```

Routes this MFE owns:

```text
/cart
/checkout/delivery
/checkout/payment
/order-confirmation
```

Routes it may request outside its ownership:

```text
/restaurants
/orders
```

No hard browser reload is part of the production contract.

## Currency and delivery contract

- Internal/event currency: `'ILS'`
- UI symbol: `₪`
- Money in events/orders is always numeric
- Discount: `0`
- Delivery fee: `10` when `subtotal < 100`; `0` when `subtotal >= 100`
- ASAP UI: `25–35 minutes`
- ASAP order value: `estimatedDeliveryMinutes: 30`
- Scheduled order: future ISO `scheduledFor`; `estimatedDeliveryMinutes: null`

## Payment contract

Technical values are exactly:

```ts
'tcash' | 'mock-card' | 'mock-wallet'
```

The completed order exposes only `paymentMethod`. It never exposes or stores full card number or CVV.
