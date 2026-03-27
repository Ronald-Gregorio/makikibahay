import { z } from 'zod';
import type {
  User,
  Listing,
  Room,
  Review,
  Message,
  Report,
  Ticket,
  SearchListingsQuery,
  NearbyListingsQuery,
  CreateListingRequest,
  UpdateListingRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoomRequest,
  CreateReviewRequest,
  CreateMessageRequest,
  CreateReportRequest
} from '@makikibahay/types';
import {
  SearchListingsQuerySchema,
  NearbyListingsQuerySchema,
  CreateListingRequestSchema,
  UpdateListingRequestSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  CreateRoomRequestSchema,
  CreateReviewRequestSchema,
  CreateMessageRequestSchema,
  CreateReportRequestSchema
} from '@makikibahay/types';

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSearchQuery(query: unknown): SearchListingsQuery {
  try {
    return SearchListingsQuerySchema.parse(query);
  } catch (error) {
    throw new ValidationError('Invalid search query', error);
  }
}

export function validateNearbyQuery(query: unknown): NearbyListingsQuery {
  try {
    return NearbyListingsQuerySchema.parse(query);
  } catch (error) {
    throw new ValidationError('Invalid nearby query', error);
  }
}

export function validateCreateListing(data: unknown): CreateListingRequest {
  try {
    return CreateListingRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid listing data', error);
  }
}

export function validateUpdateListing(data: unknown): UpdateListingRequest {
  try {
    return UpdateListingRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid listing update data', error);
  }
}

export function validateCreateUser(data: unknown): CreateUserRequest {
  try {
    return CreateUserRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid user data', error);
  }
}

export function validateUpdateUser(data: unknown): UpdateUserRequest {
  try {
    return UpdateUserRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid user update data', error);
  }
}

export function validateCreateRoom(data: unknown): CreateRoomRequest {
  try {
    return CreateRoomRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid room data', error);
  }
}

export function validateCreateReview(data: unknown): CreateReviewRequest {
  try {
    return CreateReviewRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid review data', error);
  }
}

export function validateCreateMessage(data: unknown): CreateMessageRequest {
  try {
    return CreateMessageRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid message data', error);
  }
}

export function validateCreateReport(data: unknown): CreateReportRequest {
  try {
    return CreateReportRequestSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid report data', error);
  }
}

export function generateMessageRoomId(listingId: string, userId: string, ownerId: string): string {
  return `listing_${listingId}_user_${userId}_owner_${ownerId}`;
}

export function parseMessageRoomId(roomId: string): { listingId: string; userId: string; ownerId: string } | null {
  const match = roomId.match(/^listing_(\d+)_user_(\d+)_owner_(\d+)$/);
  if (!match) return null;

  return {
    listingId: match[1],
    userId: match[2],
    ownerId: match[3],
  };
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function isWithinWalkingDistance(
  userLat: number,
  userLng: number,
  listingLat: number,
  listingLng: number,
  proximityMinutes: 5 | 10 | 15
): boolean {
  const walkingSpeedMetersPerMinute = 80; // Average walking speed ~4.8 km/h = 80 m/min
  const maxDistance = proximityMinutes * walkingSpeedMetersPerMinute;

  const distance = calculateDistance(userLat, userLng, listingLat, listingLng);
  return distance <= maxDistance;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-PH');
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}