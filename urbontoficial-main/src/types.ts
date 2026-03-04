export type Screen = 'welcome' | 'auth-phone' | 'auth-otp' | 'booking' | 'vehicle-selection' | 'payment-confirmation' | 'searching' | 'confirmed' | 'chauffeur-profile' | 'tracking' | 'profile' | 'ride-history' | 'payment-methods' | 'settings' | 'preferences' | 'customer-service' | 'country-selector' | 'services' | 'membership' | 'address-edit' | 'edit-profile' | 'legal' | 'notifications' | 'chauffeur-login' | 'chauffeur-dashboard' | 'gift-ride' | 'chauffeur-registration';

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
  yearsExperience: number;
  languages: string[];
  rating: number;
  vehicle: string;
  vehicleImage: string;
  vehicleColor: string;
  licensePlate: string;
  certifications: string[];
  reviews: { text: string; author: string; rating: number }[];
  phone: string;
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
    description: 'Mercedes-Benz E-Class, EQE, EQS or BMW 5-Series',
    price: '$85',
    competitorPrice: '$115',
    image: 'https://lh3.googleusercontent.com/d/1YCyiCKOslLhw9IuVvSYIoM3a4VHQ_S8u'
  },
  {
    id: 'suv',
    name: 'SUV Class',
    description: 'Suburban, Escalade or Lincoln Navigator',
    price: '$125',
    competitorPrice: '$160',
    image: 'https://lh3.googleusercontent.com/d/1qNamqzOFyRgZbiBfk_2woxQvToRtDeLY'
  },
  {
    id: 'concierge',
    name: 'Concierge',
    description: 'Have a trusted chauffeur handle your errands',
    price: '$60/hr',
    competitorPrice: '$95/hr',
    image: 'https://lh3.googleusercontent.com/d/1k3AWFoBkRZmHFaVHN_0Kqq2j0-t0bqOm'
  }
];

export const CHAUFFEUR: Chauffeur = {
  name: 'Alexander Sterling',
  portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
  experience: '12 Years',
  yearsExperience: 12,
  languages: ['English', 'French', 'German'],
  rating: 4.98,
  vehicle: 'Chevrolet Suburban • Silver',
  vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop',
  vehicleColor: 'Silver',
  licensePlate: 'NY-782-K9',
  certifications: ['CDL Class B', 'Defensive Driving', 'First Aid Certified', 'VIP Protocol Training'],
  reviews: [
    { text: 'Impeccable service. Alexander made our anniversary celebration truly special.', author: 'Sarah M.', rating: 5 },
    { text: 'Professional, punctual, and incredibly knowledgeable about the city.', author: 'James R.', rating: 5 },
    { text: 'The best chauffeur experience I have had in New York.', author: 'David L.', rating: 5 },
  ],
  phone: '+15550001111',
};
