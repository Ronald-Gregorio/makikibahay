import type { User, Listing, Room, Review, Message } from './types';

export interface OwnerDashboardData {
  owner: User;
  properties: OwnerProperty[];
  tenants: Tenant[];
  maintenanceRequests: MaintenanceRequest[];
  financialRecords: FinancialRecord[];
  communications: OwnerCommunication[];
  analytics: OwnerAnalytics;
}

export interface OwnerProperty extends Listing {
  propertyCode: string;
  status: 'Active' | 'Unpublished' | 'Pending';
  propertyType: 'Apartment' | 'Condo' | 'Studio Type' | 'Bed Spacer' | 'Boarding House' | 'Up and Down';
  amenities: string[];
  policies: {
    curfew?: string;
    visitors: string;
    cooking: string;
    smoking: string;
    pets: string;
    parking: string;
  };
  documents: {
    businessPermit?: string;
    fireSafety?: string;
    sanitaryPermit?: string;
    barangayClearance?: string;
  };
  maintenance: {
    lastInspection: string;
    nextInspection: string;
    pendingIssues: string[];
  };
  rooms: OwnerRoom[];
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
  };
  revenue: {
    monthlyIncome: number;
    projectedIncome: number;
    lastMonthIncome: number;
  };
}

export interface OwnerRoom extends Room {
  roomNumber: string;
  floor?: number;
  roomCode: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentTenant?: Tenant;
  tenantHistory: TenantHistory[];
  amenities: string[];
  furniture: string[];
  utilities: {
    electricityIncluded: boolean;
    waterIncluded: boolean;
    wifiIncluded: boolean;
    electricityMeter?: string;
    waterMeter?: string;
  };
  maintenance: {
    lastCleaned: string;
    nextMaintenance: string;
    issues: string[];
  };
  pricing: {
    basePrice: number;
    deposit: number;
    advancePayment: number;
    utilityDeposit?: number;
  };
  photos: RoomPhoto[];
  virtualTour?: {
    model3dUrl: string;
    waypoints: Waypoint[];
    duration: number;
  };
}

export interface Tenant {
  id: string;
  userId: string;
  roomId: string;
  propertyId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  rentalInfo: {
    startDate: string;
    endDate: string;
    monthlyRent: number;
    deposit: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'gcash' | 'maya';
    paymentDue: number;
    paymentStatus: 'paid' | 'pending' | 'overdue';
  };
  documents: {
    validId: string;
    proofOfIncome?: string;
    barangayClearance?: string;
    schoolId?: string;
  };
  status: 'active' | 'inactive' | 'terminated' | 'pending';
  notes: string[];
  violations: TenantViolation[];
  paymentHistory: PaymentRecord[];
}

export interface TenantHistory {
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  reason: string;
  finalRating: number;
  wouldRentAgain: boolean;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  roomId?: string;
  tenantId?: string;
  category: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'cleaning' | 'pest_control' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  requestedBy: 'tenant' | 'owner' | 'staff';
  requestedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  completedAt?: string;
  photos: string[];
  notes: MaintenanceNote[];
}

export interface MaintenanceNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  propertyId: string;
  type: 'income' | 'expense' | 'refund' | 'deposit';
  category: 'rent' | 'utilities' | 'maintenance' | 'supplies' | 'taxes' | 'insurance' | 'other';
  amount: number;
  description: string;
  date: string;
  method: 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'check';
  reference?: string;
  tenantId?: string;
  roomId?: string;
  receipt?: string;
  status: 'confirmed' | 'pending' | 'disputed';
  notes?: string;
}

export interface OwnerCommunication {
  id: string;
  type: 'inquiry' | 'complaint' | 'request' | 'announcement' | 'notice';
  subject: string;
  content: string;
  sender: 'owner' | 'tenant' | 'admin';
  senderId: string;
  recipientId: string;
  propertyId?: string;
  roomId?: string;
  status: 'unread' | 'read' | 'replied' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
  attachments: string[];
  replies: CommunicationReply[];
}

export interface CommunicationReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  attachments: string[];
}

export interface OwnerAnalytics {
  overview: {
    totalProperties: number;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageRating: number;
    totalTenants: number;
  };
  revenue: {
    monthly: MonthlyRevenue[];
    yearly: YearlyRevenue[];
    projected: number;
    actual: number;
    variance: number;
  };
  occupancy: {
    monthly: MonthlyOccupancy[];
    byProperty: PropertyOccupancy[];
    trends: OccupancyTrend[];
  };
  maintenance: {
    requestsByCategory: MaintenanceCategoryStats[];
    averageResolutionTime: number;
    monthlyCosts: MonthlyMaintenanceCost[];
    upcoming: MaintenanceRequest[];
  };
  tenantSatisfaction: {
    averageRating: number;
    ratingsByProperty: PropertyRating[];
    complaints: TenantComplaint[];
    retentionRate: number;
  };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  projectedRevenue: number;
}

export interface YearlyRevenue {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

export interface MonthlyOccupancy {
  month: string;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
}

export interface PropertyOccupancy {
  propertyId: string;
  propertyName: string;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  revenue: number;
}

export interface OccupancyTrend {
  period: string;
  rate: number;
  change: number;
}

export interface MaintenanceCategoryStats {
  category: string;
  count: number;
  cost: number;
  averageResolutionTime: number;
}

export interface MonthlyMaintenanceCost {
  month: string;
  cost: number;
  requests: number;
}

export interface PropertyRating {
  propertyId: string;
  propertyName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface TenantComplaint {
  id: string;
  category: string;
  count: number;
  resolved: number;
  pending: number;
}

export interface TenantViolation {
  id: string;
  type: 'noise' | 'curfew' | 'visitor' | 'payment' | 'damage' | 'other';
  description: string;
  date: string;
  status: 'warning' | 'penalty' | 'resolved';
  penalty?: number;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  amount: number;
  type: 'rent' | 'utilities' | 'deposit' | 'penalty' | 'other';
  method: 'cash' | 'bank_transfer' | 'gcash' | 'maya';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  reference?: string;
  notes?: string;
}

export interface RoomPhoto {
  id: string;
  url: string;
  caption?: string;
  isCover: boolean;
  category: 'overall' | 'bedroom' | 'bathroom' | 'kitchen' | 'amenities' | 'view';
}

export interface Waypoint {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  hotspotCoordinates: {
    lat: number;
    lng: number;
  };
  name: string;
  description?: string;
}

export const sampleOwnerDashboardData: OwnerDashboardData = {
  owner: {
    id: 'owner_101',
    email: 'sunny.day@makikibahay.com',
    name: 'Sunny Day',
    role: 'owner',
  },
  properties: [
    {
      id: '1',
      _id: '1',
      ownerId: {
        _id: '101',
        name: 'Sunny Day',
        avatar: 'https://placehold.co/40x40.png'
      },
      listingName: 'Sunshine Residences',
      propertyType: 'Apartment',
      description: 'Great place, very clean and accessible!',
      rating: 5,
      photos: ['https://placehold.co/600x400.png'],
      fullAddress: '123 Mabini St, Cabanatuan City',
      lat: 15.4849,
      lng: 120.9619,
      roomType: 'Solo Room',
      availableRooms: 3,
      bedrooms: '1',
      bathrooms: '1',
      squareFeet: 12,
      monthlyRent: 3500,
      moveInDate: '2024-06-01',
      securityDeposit: 3500,
      advancePayment: 3500,
      applicationReviewFee: 0,
      specialtyProperty: 'None',
      petPolicy: 'No Pets',
      hasEnhancedViewing: false,
      hasCurfew: false,
      visitorsAllowed: true,
      smokingAllowed: false,
      cookingAllowed: true,
      quietHours: '10 PM',
      airConditioning: false,
      wifi: true,
      washer: false,
      dryer: false,
      utilitiesIncluded: true,
      dishwasher: false,
      parkingType: 'None',
      laundryFacilities: false,
      kitchen: true,
      appliancesIncluded: false,
      status: 'Active',
      createdAt: '2023-10-01T10:00:00Z',
      updatedAt: '2024-05-20T15:30:00Z',
      floorPlans: [],
      neighborhoodNear: ['University'],
      transportationOptions: ['Jeepney'],
      rooms: [],
      propertyCode: 'SUN-001',
      amenities: ['Wi-Fi', 'Kitchen', 'Laundry Area'],
      policies: {
        visitors: 'Until 10 PM',
        cooking: 'Allowed in kitchen only',
        smoking: 'Not allowed',
        pets: 'Not allowed',
        parking: 'Available for residents',
      },
      documents: {
        businessPermit: 'docs/business_permit_sun.pdf',
        fireSafety: 'docs/fire_safety_sun.pdf',
      },
      maintenance: {
        lastInspection: '2024-01-15',
        nextInspection: '2024-04-15',
        pendingIssues: ['Fix leak in Room 205 bathroom'],
      },
      occupancy: {
        totalRooms: 10,
        occupiedRooms: 7,
        availableRooms: 3,
        occupancyRate: 70,
      },
      revenue: {
        monthlyIncome: 24500,
        projectedIncome: 28000,
        lastMonthIncome: 25200,
      },
    },
  ],
  tenants: [
    {
      id: 'tenant_201',
      userId: 'user_201',
      roomId: 'room_201',
      propertyId: 'prop_101',
      personalInfo: {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '09123456789',
        address: '456 Sample St, Cabanatuan City',
        birthDate: '1995-06-15',
        emergencyContact: {
          name: 'John Doe',
          relationship: 'Brother',
          phone: '09123456790',
        },
      },
      rentalInfo: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        monthlyRent: 3500,
        deposit: 3500,
        paymentMethod: 'bank_transfer',
        paymentDue: 3500,
        paymentStatus: 'paid',
      },
      documents: {
        validId: 'docs/jane_id.pdf',
        proofOfIncome: 'docs/jane_income.pdf',
      },
      status: 'active',
      notes: ['Good tenant, always on time with payments'],
      violations: [],
      paymentHistory: [],
    },
  ],
  maintenanceRequests: [
    {
      id: 'mr_001',
      propertyId: 'prop_101',
      roomId: 'room_205',
      tenantId: 'tenant_201',
      category: 'plumbing',
      priority: 'medium',
      title: 'Leaking bathroom faucet',
      description: 'The bathroom faucet is constantly dripping, wasting water.',
      requestedBy: 'tenant',
      requestedAt: '2024-01-25T10:30:00Z',
      status: 'pending',
      estimatedCost: 500,
      photos: ['https://placehold.co/400x300.png'],
      notes: [],
    },
  ],
  financialRecords: [
    {
      id: 'fr_001',
      propertyId: 'prop_101',
      type: 'income',
      category: 'rent',
      amount: 3500,
      description: 'Monthly rent - Jane Doe',
      date: '2024-01-01',
      method: 'bank_transfer',
      reference: 'TXN-001',
      tenantId: 'tenant_201',
      status: 'confirmed',
    },
  ],
  communications: [
    {
      id: 'comm_001',
      type: 'inquiry',
      subject: 'Room availability for February',
      content: 'Hi, I would like to inquire about room availability for next month.',
      sender: 'tenant',
      senderId: 'user_202',
      recipientId: 'owner_101',
      status: 'unread',
      priority: 'medium',
      createdAt: '2024-01-27T09:00:00Z',
      attachments: [],
      replies: [],
    },
  ],
  analytics: {
    overview: {
      totalProperties: 1,
      totalRooms: 10,
      occupiedRooms: 7,
      occupancyRate: 70,
      monthlyRevenue: 24500,
      yearlyRevenue: 294000,
      averageRating: 4.5,
      totalTenants: 7,
    },
    revenue: {
      monthly: [],
      yearly: [],
      projected: 28000,
      actual: 24500,
      variance: -3500,
    },
    occupancy: {
      monthly: [],
      byProperty: [],
      trends: [],
    },
    maintenance: {
      requestsByCategory: [],
      averageResolutionTime: 48,
      monthlyCosts: [],
      upcoming: [],
    },
    tenantSatisfaction: {
      averageRating: 4.5,
      ratingsByProperty: [],
      complaints: [],
      retentionRate: 85,
    },
  },
};

export const ownerDashboardCRUD = {
  createProperty: (propertyData: Partial<OwnerProperty>) => ({
    id: `prop_${Date.now()}`,
    ...propertyData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as OwnerProperty),

  updateProperty: (propertyId: string, updates: Partial<OwnerProperty>) => ({
    id: propertyId,
    ...updates,
    updated_at: new Date().toISOString(),
  } as OwnerProperty),

  deleteProperty: (propertyId: string) => ({ success: true, deletedId: propertyId }),

  createRoom: (roomData: Partial<OwnerRoom>) => ({
    id: `room_${Date.now()}`,
    ...roomData,
  } as OwnerRoom),

  updateRoom: (roomId: string, updates: Partial<OwnerRoom>) => ({
    id: roomId,
    ...updates,
  } as OwnerRoom),

  deleteRoom: (roomId: string) => ({ success: true, deletedId: roomId }),

  createTenant: (tenantData: Partial<Tenant>) => ({
    id: `tenant_${Date.now()}`,
    ...tenantData,
    status: 'active' as const,
  } as Tenant),

  updateTenant: (tenantId: string, updates: Partial<Tenant>) => ({
    id: tenantId,
    ...updates,
  } as Tenant),

  createMaintenanceRequest: (requestData: Partial<MaintenanceRequest>) => ({
    id: `mr_${Date.now()}`,
    ...requestData,
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
  } as MaintenanceRequest),

  updateMaintenanceRequest: (requestId: string, updates: Partial<MaintenanceRequest>) => ({
    id: requestId,
    ...updates,
  } as MaintenanceRequest),
};
