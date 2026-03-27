export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  status?: 'Active' | 'Suspended';
}

export interface OnboardingSurvey {
  survey_id: number;
  user_id: number;
  is_student: boolean;
  accommodation_type: 'solo' | 'shared' | 'studio' | 'bed-space' | 'up_and_down';
  price_min: number;
  price_max: number;
  amenities: string[];
  location_lat: number;
  location_lng: number;
  created_at: string;
}

export interface Listing {
  id: string;
  _id?: string;
  ownerId?: string | {
    id?: string;
    _id?: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  
  // 1. Core Property Info
  listingName: string;
  propertyType: 'Apartment' | 'Condo' | 'Studio Type' | 'Bed Spacer' | 'Boarding House' | 'Up and Down';
  description: string;
  rating: number;
  
  // 2. Media & Virtual Viewing
  photos: string[];
  video?: string;
  virtualTour360?: string;
  hasEnhancedViewing: boolean;
  floorPlans: string[];

  // 3. Location & Neighborhood
  fullAddress: string;
  lat: number;
  lng: number;
  neighborhoodNear: string[]; // Enums: School, University, etc.
  transportationOptions: string[];

  // 4. Room, Unit Details & Pricing
  roomType: string;
  availableRooms: number;
  bedrooms: 'Studio' | '1' | '2' | '3' | '4+';
  bathrooms: '1' | '2' | '3+';
  squareFeet: number;
  monthlyRent: number;
  moveInDate: string;

  // 5. Fees & Policies
  securityDeposit: number;
  advancePayment: number;
  applicationReviewFee: number;
  specialtyProperty: 'Student Only' | 'Worker Only' | 'Income Restricted' | 'Short-Term' | 'None';

  // 6. Pet Policy
  petPolicy: 'Cat Friendly' | 'Dog Friendly' | 'Any Pet Friendly' | 'Small Dogs Only' | 'No Pets';

  // 7. House Rules
  hasCurfew: boolean;
  visitorsAllowed: boolean;
  smokingAllowed: boolean;
  cookingAllowed: boolean;
  quietHours: string;

  // 8. Amenities
  airConditioning: boolean;
  wifi: boolean;
  washer: boolean;
  dryer: boolean;
  utilitiesIncluded: boolean;
  dishwasher: boolean;
  parkingType: 'None' | 'Outside' | 'Garage';
  laundryFacilities: boolean;
  kitchen: boolean;
  appliancesIncluded: boolean;

  // Meta
  status: 'Active' | 'Unpublished' | 'Pending';
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for compatibility
  name?: string;
  address?: string;
  priceMin?: number;
  priceMax?: number;
  totalRooms?: number;
  available_rooms?: number;
  total_rooms?: number;
  amenities?: string[];
  rules?: string[];
  reviews?: Review[];
  rooms?: Room[];
  owner_name?: string; // Legacy field for admin table
}

export interface Room {
  room_id: string | number;
  listing_id: string | number;
  type: string;
  size_sqm: number;
  price: number;
  inclusions: string[];
  is_available: boolean;
  model_3d_url?: string;
}

export interface ListingPhoto {
  photo_id: string | number;
  listing_id: string | number;
  url: string;
  is_cover: boolean;
  is_hidden?: boolean;
}

export interface Review {
  review_id: string | number;
  _id?: string;
  user_id: string | number;
  listing_id: string | number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
    avatar: string;
  };
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number;
  content: string;
  sent_at: string;
}

export interface SurveyData {
  userType: 'student' | 'worker';
  accommodationType: string[];
  priceRange: [number, number];
  amenities: string[];
  location: string;
  walkingDistance: '5' | '10' | '15';
}
