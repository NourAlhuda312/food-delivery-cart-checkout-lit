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

export type DeliveryMethod = 'asap' | 'scheduled';
export type PaymentMethod = 'cash' | 'mock-card' | 'mock-wallet';
export type OrderStatus = 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

export interface CompletedOrder {
  orderId: string;
  userId: string | null;
  restaurantId: string;
  restaurantName: string;
  items: MealItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  scheduledFor: string | null;
  estimatedDeliveryMinutes: number | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  currency: 'ILS';
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface CartAddItemDetail { item: MealItem }
export interface CartUpdatedDetail {
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  restaurantId: string | null;
  currency: 'ILS';
}
export interface OrderCompletedDetail { order: CompletedOrder }
export interface NavigationRequestedDetail { route: string }
