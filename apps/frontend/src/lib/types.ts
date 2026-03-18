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
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  total_rooms: number;
  available_rooms: number;
  rules: string[];
  price_min: number;
  price_max: number;
  amenities?: string[];
  status?: 'Active' | 'Unpublished' | 'Pending';
  created_at: string;
  updated_at: string;
  photos: ListingPhoto[];
  rooms: Room[];
  reviews: Review[];
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
