export type Screen = 'welcome' | 'auth-phone' | 'auth-otp' | 'booking' | 'vehicle-selection' | 'payment-confirmation' | 'searching' | 'confirmed' | 'chauffeur-profile' | 'tracking' | 'profile' | 'ride-history' | 'payment-methods' | 'settings' | 'preferences' | 'customer-service' | 'country-selector' | 'services' | 'membership' | 'address-edit' | 'edit-profile' | 'legal' | 'notifications' | 'chauffeur-login' | 'chauffeur-dashboard' | 'gift-ride' | 'chauffeur-registration' | 'api-health' | 'schedule-ride' | 'trip-completed';

export interface Vehicle {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  competitorPrice: string;
}

export interface Chauffeur {
  name: string;
  portrait: string;
  experience: string;
  languages: string[];
  rating: number;
}

export interface UserProfile {
  title?: 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.';
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName?: string;
  accountType: 'personal' | 'business';
  homeAddress?: string;
  workAddress?: string;
  otherAddresses: { id: string; label: string; address: string }[];
}

export const VEHICLES: Vehicle[] = [
  {
    id: 'business',
    name: 'Business Class',
    description: 'Cadillac CT5, Lincoln Continental or similar',
    price: '$85',
    competitorPrice: '$115',
    image: 'https://lh3.googleusercontent.com/d/1YCyiCKOslLhw9IuVvSYIoM3a4VHQ_S8u'
  },
  {
    id: 'suv',
    name: 'SUV Class',
    description: 'Escalade, Suburban, Tahoe, GMC Yukon or Lincoln Navigator',
    price: '$125',
    competitorPrice: '$160',
    image: 'https://lh3.googleusercontent.com/d/1qNamqzOFyRgZbiBfk_2woxQvToRtDeLY'
  },
  {
    id: 'concierge',
    name: 'Concierge',
    description: 'Personal assistance for errands, deliveries, and tasks.',
    price: '$60/hr',
    competitorPrice: '$95/hr',
    image: 'https://lh3.googleusercontent.com/d/1k3AWFoBkRZmHFaVHN_0Kqq2j0-t0bqOm'
  }
];

export interface RideRating {
  rideId: string;
  rating: number;
  comment: string;
  isFavorite: boolean;
  timestamp: string;
}

export interface FavoriteDriver {
  driverId: string;
  name: string;
  portrait: string;
  addedAt: string;
}

export const CHAUFFEUR: Chauffeur = {
  name: 'Alexander Sterling',
  portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
  experience: '12 Years',
  languages: ['English', 'French', 'German'],
  rating: 4.98
};
