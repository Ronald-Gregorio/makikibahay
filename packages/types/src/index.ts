import { z } from 'zod';

export const UserRoleSchema = z.enum(['user', 'owner', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AccommodationTypeSchema = z.enum(['solo', 'shared', 'studio', 'bed-space']);
export type AccommodationType = z.infer<typeof AccommodationTypeSchema>;

export const ProximityMinutesSchema = z.union([z.literal(5), z.literal(10), z.literal(15)]);
export type ProximityMinutes = z.infer<typeof ProximityMinutesSchema>;

export const ReportTypeSchema = z.enum(['listing', 'owner', 'user']);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const ReportStatusSchema = z.enum(['pending', 'reviewed', 'resolved', 'dismissed']);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export const LocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat] - longitude first, latitude second for GeoJSON
});

export const UserPreferencesSchema = z.object({
  isStudent: z.boolean(),
  accommodationType: AccommodationTypeSchema,
  priceMin: z.number().min(0),
  priceMax: z.number().min(0),
  amenities: z.array(z.string()),
  location: LocationSchema,
  proximityMinutes: z.literal(10).default(10),
});

export const WaypointSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  hotspotCoordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// Database document schemas
export const UserSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema.default('user'),
  avatar: z.string().url().optional(),
  preferences: UserPreferencesSchema.optional(),
  favorites: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ListingSchema = z.object({
  _id: z.string().optional(),
  ownerId: z.string(),
  name: z.string().min(1),
  address: z.string().min(1),
  location: LocationSchema,
  totalRooms: z.number().min(1),
  availableRooms: z.number().min(0),
  priceMin: z.number().min(0),
  priceMax: z.number().min(0),
  rules: z.array(z.string()),
  amenities: z.array(z.string()),
  coverPhoto: z.string().url().optional(),
  photos: z.array(z.string().url()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const RoomSchema = z.object({
  _id: z.string().optional(),
  listingId: z.string(),
  sizeSqm: z.number().min(1),
  price: z.number().min(0),
  inclusions: z.array(z.string()),
  isAvailable: z.boolean().default(true),
  model3dUrl: z.string().url().optional(),
  waypoints: z.array(WaypointSchema).optional(),
});

export const ReviewSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  listingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
  createdAt: z.date().optional(),
});

export const MessageSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  listingId: z.string(),
  content: z.string().min(1).max(1000),
  sentAt: z.date().optional(),
  isRead: z.boolean().default(false),
});

export const ReportSchema = z.object({
  _id: z.string().optional(),
  reporterId: z.string(),
  reportedUserId: z.string(),
  reportType: ReportTypeSchema,
  targetId: z.string(),
  description: z.string().min(10).max(500),
  status: ReportStatusSchema.default('pending'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const TicketSchema = z.object({
  _id: z.string().optional(),
  reportId: z.string(),
  assignedAdminId: z.string().optional(),
  notes: z.string().optional(),
  resolution: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


export const CreateUserRequestSchema = UserSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UpdateUserRequestSchema = UserSchema.partial().omit({ _id: true, email: true, createdAt: true, updatedAt: true });
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export const CreateListingRequestSchema = ListingSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type CreateListingRequest = z.infer<typeof CreateListingRequestSchema>;

export const UpdateListingRequestSchema = ListingSchema.partial().omit({ _id: true, ownerId: true, createdAt: true, updatedAt: true });
export type UpdateListingRequest = z.infer<typeof UpdateListingRequestSchema>;

export const CreateRoomRequestSchema = RoomSchema.omit({ _id: true });
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const CreateReviewRequestSchema = ReviewSchema.omit({ _id: true, createdAt: true });
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;

export const CreateMessageRequestSchema = MessageSchema.omit({ _id: true, sentAt: true });
export type CreateMessageRequest = z.infer<typeof CreateMessageRequestSchema>;

export const CreateReportRequestSchema = ReportSchema.omit({ _id: true, status: true, createdAt: true, updatedAt: true });
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;


export const SearchListingsQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  maxDistance: z.coerce.number().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  type: AccommodationTypeSchema.optional(),
  amenities: z.array(z.string()).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type SearchListingsQuery = z.infer<typeof SearchListingsQuerySchema>;

export const NearbyListingsQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  proximityMinutes: z.literal(10).default(10),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type NearbyListingsQuery = z.infer<typeof NearbyListingsQuerySchema>;


export const JoinRoomEventSchema = z.object({
  roomId: z.string(),
});

export type JoinRoomEvent = z.infer<typeof JoinRoomEventSchema>;

export const SendMessageEventSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(1000),
  receiverId: z.string(),
});

export type SendMessageEvent = z.infer<typeof SendMessageEventSchema>;

export const TypingEventSchema = z.object({
  roomId: z.string(),
  isTyping: z.boolean(),
});

export type TypingEvent = z.infer<typeof TypingEventSchema>;

export const MessageReadEventSchema = z.object({
  roomId: z.string(),
  messageId: z.string(),
});

export type MessageReadEvent = z.infer<typeof MessageReadEventSchema>;


export type User = z.infer<typeof UserSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type Waypoint = z.infer<typeof WaypointSchema>;


export type ListingWithOwner = Listing & {
  owner: User;
  rooms: Room[];
  reviews: Review[];
};

export type UserWithFavorites = User & {
  favorites: Listing[];
};

export type RoomWithListing = Room & {
  listing: Listing;
};

export type MessageWithDetails = Message & {
  sender: User;
  receiver: User;
  listing: Listing;
};

export type ReportWithDetails = Report & {
  reporter: User;
  reportedUser: User;
  ticket?: Ticket;
};

export type TicketWithDetails = Ticket & {
  report: Report & {
    reporter: User;
    reportedUser: User;
  };
  assignedAdmin?: User;
};