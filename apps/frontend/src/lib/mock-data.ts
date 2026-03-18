import type { Listing } from './types';

export const listings: Listing[] = [
  {
    id: '1',
    owner_id: '101',
    owner_name: 'Sunny Day',
    owner_phone: '09171234567',
    name: 'Sunshine Residences',
    address: '123 Mabini St, Cabanatuan City',
    lat: 15.4849,
    lng: 120.9619,
    total_rooms: 10,
    available_rooms: 3,
    rules: ['No curfew', 'Visitors allowed until 10 PM', 'No smoking'],
    price_min: 3500,
    price_max: 5000,
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2024-05-20T15:30:00Z',
    photos: [
      { photo_id: 101, listing_id: 1, url: 'https://placehold.co/600x400.png', is_cover: true },
      { photo_id: 102, listing_id: 1, url: 'https://placehold.co/600x400.png', is_cover: false },
      { photo_id: 103, listing_id: 1, url: 'https://placehold.co/600x400.png', is_cover: false },
    ],
    rooms: [
      { room_id: 201, listing_id: 1, type: 'Solo Room', size_sqm: 12, price: 3500, inclusions: ['Bed', 'Fan', 'Wi-Fi'], is_available: true, model_3d_url: 'placeholder_url' },
      { room_id: 202, listing_id: 1, type: 'Studio Type', size_sqm: 15, price: 5000, inclusions: ['Bed', 'Aircon', 'Wi-Fi', 'Private CR'], is_available: true, model_3d_url: 'placeholder_url' },
    ],
    reviews: [
      { review_id: 301, listing_id: 1, user_id: 201, rating: 5, comment: 'Great place, very clean and accessible!', created_at: '2024-04-15T08:00:00Z', user: { name: 'Jane Doe', avatar: 'https://placehold.co/40x40.png' } },
      { review_id: 302, listing_id: 1, user_id: 202, rating: 4, comment: 'Landlord is very accomodating.', created_at: '2024-05-01T12:00:00Z', user: { name: 'John Smith', avatar: 'https://placehold.co/40x40.png' } },
    ]
  },
  {
    id: '2',
    owner_id: '102',
    owner_name: 'Maria Maple',
    owner_phone: '09287654321',
    name: 'Maple Tree Dormitory',
    address: '456 Burgos Ave, Cabanatuan City',
    lat: 15.4941,
    lng: 120.9723,
    total_rooms: 20,
    available_rooms: 5,
    rules: ['Students only', 'Curfew at 11 PM', 'Cooking not allowed'],
    price_min: 2500,
    price_max: 4000,
    created_at: '2023-11-15T12:00:00Z',
    updated_at: '2024-05-18T11:00:00Z',
    photos: [
      { photo_id: 104, listing_id: 2, url: 'https://placehold.co/600x400.png', is_cover: true },
      { photo_id: 105, listing_id: 2, url: 'https://placehold.co/600x400.png', is_cover: false },
    ],
    rooms: [
      { room_id: 203, listing_id: 2, type: 'Bed Spacer', size_sqm: 10, price: 2500, inclusions: ['Bunk bed', 'Locker', 'Fan'], is_available: true, model_3d_url: 'placeholder_url' },
    ],
    reviews: [
      { review_id: 303, listing_id: 2, user_id: 203, rating: 4, comment: 'Perfect for students, near the university.', created_at: '2024-03-20T18:00:00Z', user: { name: 'Maria Cruz', avatar: 'https://placehold.co/40x40.png' } },
    ]
  },
  {
    id: '3',
    owner_id: '103',
    owner_name: 'Pat Professional',
    owner_phone: '09998887766',
    name: 'The Professional\'s Pad',
    address: '789 Gen. Tinio St, Cabanatuan City',
    lat: 15.4833,
    lng: 120.9665,
    total_rooms: 8,
    available_rooms: 1,
    rules: ['No pets', 'Parking available', 'Quiet hours after 10 PM'],
    price_min: 6000,
    price_max: 8000,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-05-21T10:00:00Z',
    photos: [
      { photo_id: 106, listing_id: 3, url: 'https://placehold.co/600x400.png', is_cover: true },
    ],
    rooms: [
      { room_id: 204, listing_id: 3, type: 'Up and Down', size_sqm: 20, price: 6000, inclusions: ['Queen bed', 'Aircon', 'Mini-fridge', 'Desk'], is_available: false, model_3d_url: 'placeholder_url' },
      { room_id: 205, listing_id: 3, type: 'Studio Type', size_sqm: 25, price: 8000, inclusions: ['Queen bed', 'Aircon', 'Mini-fridge', 'Desk', 'Kitchenette'], is_available: true, model_3d_url: 'placeholder_url' },
    ],
    reviews: [
      { review_id: 304, listing_id: 3, user_id: 204, rating: 5, comment: 'Spacious and comfortable. Highly recommended for working professionals.', created_at: '2024-05-10T14:00:00Z', user: { name: 'Robert Chen', avatar: 'https://placehold.co/40x40.png' } },
    ]
  }
];

export const featuredListings = listings.slice(0, 3);
