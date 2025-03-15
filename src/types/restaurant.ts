export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  address: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface UserPreferences {
  spicyPreference: 'yes' | 'no' | 'either';
  vegetarianOnly: boolean;
  priceRange: string[];
  cuisineTypes: string[];
  excludedFoods: string[];
}

export interface SpinWheelItem {
  id: string;
  name: string;
  color: string;
  weight?: number;
} 