export type Size = 'Small' | 'Large';

export type Sweetness = 'Less Sweet' | 'Normal' | 'Extra Sweet';

export type IceLevel = 'No Ice' | 'Light Ice' | 'Normal Ice' | 'Extra Ice';

export type LemonadeType = 'Classic' | 'Strawberry' | 'Minty';

export interface LemonadeItem {
  id: string;
  name: LemonadeType;
  description: string;
  basePrice: number;
  image: string;
}

export interface CustomizationOptions {
  size: Size;
  sweetness: Sweetness;
  ice: IceLevel;
}

export interface CartItem extends LemonadeItem {
  options: CustomizationOptions;
  finalPrice: number;
  quantity: number;
}

export const LEMONADE_ITEMS: LemonadeItem[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Our signature fresh-squeezed lemonade with the perfect balance of sweet and tart',
    basePrice: 4.99,
    image: '/lemonades/classic.svg'
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    description: 'Sweet strawberries blended with our classic lemonade for a fruity twist',
    basePrice: 5.99,
    image: '/lemonades/strawberry.svg'
  },
  {
    id: 'minty',
    name: 'Minty',
    description: 'Refreshing mint-infused lemonade, perfect for hot summer days',
    basePrice: 5.49,
    image: '/lemonades/minty.svg'
  }
];

export const SIZE_PRICES: Record<Size, number> = {
  'Small': 0,
  'Large': 2.00
};
