import type { MealItem } from '../contracts';

export const DEMO_ITEMS: readonly MealItem[] = [
  {
    id: 'meal-101', restaurantId: 'rest-01', restaurantName: 'Burger House', name: 'Classic Cheeseburger',
    description: 'Beef patty, cheddar, lettuce, tomato, pickles, and house sauce in a toasted bun.',
    price: 35, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', category: 'Burgers', quantity: 1,
  },
  {
    id: 'meal-104', restaurantId: 'rest-01', restaurantName: 'Burger House', name: 'Loaded House Fries',
    description: 'Crispy fries topped with cheese sauce, caramelized onions, and burger sauce.',
    price: 24, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80', category: 'Sides', quantity: 1,
  },
  {
    id: 'meal-201', restaurantId: 'rest-02', restaurantName: 'Olive & Zaatar', name: 'Musakhan Rolls',
    description: 'Sumac chicken, caramelized onions, toasted pine nuts, and taboon bread rolls.',
    price: 42, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', category: 'Main Dishes', quantity: 1,
  },
];
