import type { User, Listing, Room, Review, Message } from './types';

export interface AdminDashboardData {
  admin: User;
  systemMetrics: SystemMetrics;
  userReports: UserReport[];
  moderationQueue: ModerationItem[];
  analytics: AdminAnalytics;
  auditLogs: AuditLog[];
  systemHealth: SystemHealth;
  revenueAnalytics: RevenueAnalytics;
  occupancyAnalytics: OccupancyAnalytics;
  userManagement: UserManagement;
}

export interface SystemMetrics {
  totalUsers: number;
  totalOwners: number;
  totalListings: number;
  totalRooms: number;
  activeListings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageOccupancy: number;
  totalReviews: number;
  averageRating: number;
  supportTickets: number;
  pendingReports: number;
  systemUptime: number;
}

export interface UserReport {
  id: string;
  reportId: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserType: 'user' | 'owner';
  reportType: 'listing' | 'owner' | 'user' | 'review' | 'message';
  targetId: string;
  targetType: string;
  category: 'fraud' | 'harassment' | 'misrepresentation' | 'spam' | 'inappropriate_content' | 'policy_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: {
    screenshots: string[];
    messages: string[];
    documents: string[];
    links: string[];
  };
  status: 'pending' | 'under_review' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  actionTaken: 'none' | 'warning' | 'suspension' | 'ban' | 'content_removal' | 'listing_removal';
  notes: ReportNote[];
  timeline: ReportTimeline[];
}

export interface ReportNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface ReportTimeline {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
}

export interface ModerationItem {
  id: string;
  type: 'listing' | 'review' | 'user' | 'message' | 'photo';
  targetId: string;
  targetType: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorType: 'user' | 'owner';
  reason: string;
  flags: {
    autoDetected: boolean;
    userReports: number;
    aiConfidence: number;
    violations: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  decision: string;
  appealStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface AdminAnalytics {
  overview: {
    totalReports: number;
    resolvedReports: number;
    pendingReports: number;
    averageResolutionTime: number;
    reportTrends: ReportTrend[];
  };
  categories: {
    fraud: ReportCategoryStats;
    harassment: ReportCategoryStats;
    misrepresentation: ReportCategoryStats;
    spam: ReportCategoryStats;
    inappropriate_content: ReportCategoryStats;
    policy_violation: ReportCategoryStats;
    other: ReportCategoryStats;
  };
  performance: {
    resolutionRate: number;
    averageResponseTime: number;
    escalationRate: number;
    appealRate: number;
    satisfactionScore: number;
  };
  workload: {
    reportsPerAdmin: WorkloadStats[];
    busiestHours: HourlyStats[];
    monthlyVolume: MonthlyVolume[];
  };
}

export interface ReportTrend {
  period: string;
  total: number;
  resolved: number;
  pending: number;
  category: string;
}

export interface ReportCategoryStats {
  total: number;
  resolved: number;
  pending: number;
  averageResolutionTime: number;
  commonReasons: string[];
}

export interface WorkloadStats {
  adminId: string;
  adminName: string;
  totalReports: number;
  resolvedReports: number;
  averageResolutionTime: number;
  activeReports: number;
}

export interface HourlyStats {
  hour: number;
  reports: number;
  resolutions: number;
}

export interface MonthlyVolume {
  month: string;
  reports: number;
  resolutions: number;
  averageResolutionTime: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: {
    oldValue?: any;
    newValue?: any;
    reason?: string;
    ipAddress: string;
    userAgent: string;
  };
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'user_management' | 'content_moderation' | 'system_admin' | 'security' | 'data_management';
  outcome: 'success' | 'failure' | 'partial';
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  services: ServiceHealth[];
  resources: ResourceUsage[];
  alerts: SystemAlert[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastCheck: string;
  uptime: number;
  errorRate: number;
}

export interface ResourceUsage {
  resource: string;
  usage: number;
  limit: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface RevenueAnalytics {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenueGrowth: number;
    projectedRevenue: number;
  };
  breakdown: {
    byProperty: PropertyRevenue[];
    byCategory: RevenueCategory[];
    byPaymentMethod: PaymentMethodStats[];
  };
  trends: {
    monthly: MonthlyRevenueTrend[];
    yearly: YearlyRevenueTrend[];
    forecast: RevenueForecast[];
  };
  leaks: {
    detectedLeaks: RevenueLeak[];
    potentialLeaks: PotentialLeak[];
    totalLost: number;
    recovered: number;
  };
}

export interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  ownerId: string;
  ownerName: string;
  revenue: number;
  occupancy: number;
  averageRent: number;
  growth: number;
}

export interface RevenueCategory {
  category: string;
  amount: number;
  percentage: number;
  growth: number;
}

export interface PaymentMethodStats {
  method: string;
  amount: number;
  count: number;
  percentage: number;
  failureRate: number;
}

export interface MonthlyRevenueTrend {
  month: string;
  revenue: number;
  growth: number;
  projected: number;
  variance: number;
}

export interface YearlyRevenueTrend {
  year: number;
  revenue: number;
  growth: number;
  projected: number;
  variance: number;
}

export interface RevenueForecast {
  period: string;
  projected: number;
  confidence: number;
  factors: string[];
}

export interface RevenueLeak {
  id: string;
  type: 'unpaid_rent' | 'late_fees' | 'utility_overcharges' | 'vacancy' | 'maintenance' | 'fraud';
  propertyId: string;
  propertyName: string;
  amount: number;
  detected: string;
  status: 'active' | 'investigating' | 'resolved';
  description: string;
  evidence: string[];
  recovery: {
    amount: number;
    method: string;
    status: string;
  };
}

export interface PotentialLeak {
  id: string;
  type: string;
  risk: 'low' | 'medium' | 'high';
  estimatedAmount: number;
  description: string;
  recommendation: string;
  priority: number;
}

export interface OccupancyAnalytics {
  overview: {
    totalProperties: number;
    totalRooms: number;
    occupiedRooms: number;
    averageOccupancy: number;
    occupancyRate: number;
    vacancyRate: number;
  };
  trends: {
    monthly: MonthlyOccupancyTrend[];
    seasonal: SeasonalPattern[];
    forecast: OccupancyForecast[];
  };
  breakdown: {
    byProperty: PropertyOccupancy[];
    byRoomType: RoomTypeOccupancy[];
    byLocation: LocationOccupancy[];
  };
  insights: {
    highPerforming: PropertyInsight[];
    underPerforming: PropertyInsight[];
    recommendations: OccupancyRecommendation[];
  };
}

export interface MonthlyOccupancyTrend {
  month: string;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  newTenants: number;
  departedTenants: number;
}

export interface SeasonalPattern {
  season: string;
  averageOccupancy: number;
  peakMonths: string[];
  lowMonths: string[];
  factors: string[];
}

export interface OccupancyForecast {
  period: string;
  projectedOccupancy: number;
  confidence: number;
  factors: string[];
}

export interface PropertyOccupancy {
  propertyId: string;
  propertyName: string;
  ownerId: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  averageRent: number;
  revenue: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface RoomTypeOccupancy {
  roomType: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  averageRent: number;
  demand: 'high' | 'medium' | 'low';
}

export interface LocationOccupancy {
  area: string;
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  averageRent: number;
}

export interface PropertyInsight {
  propertyId: string;
  propertyName: string;
  metric: string;
  value: number;
  benchmark: number;
  performance: 'above' | 'below' | 'at';
  factors: string[];
}

export interface OccupancyRecommendation {
  id: string;
  type: 'pricing' | 'marketing' | 'amenities' | 'maintenance' | 'policy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: string;
  targetProperties: string[];
}

export interface UserManagement {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    suspendedUsers: number;
    bannedUsers: number;
  };
  users: User[];
  roles: UserRole[];
  permissions: Permission[];
  activities: UserActivity[];
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: string[];
}

export interface UserActivity {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export const sampleAdminDashboardData: AdminDashboardData = {
  admin: {
    id: 'admin_001',
    email: 'admin@makikibahay.com',
    name: 'Admin User',
    role: 'admin',
  },
  systemMetrics: {
    totalUsers: 1250,
    totalOwners: 45,
    totalListings: 38,
    totalRooms: 420,
    activeListings: 35,
    totalRevenue: 2450000,
    monthlyRevenue: 245000,
    averageOccupancy: 78.5,
    totalReviews: 892,
    averageRating: 4.2,
    supportTickets: 23,
    pendingReports: 8,
    systemUptime: 99.8,
  },
  userReports: [
    {
      id: 'report_001',
      reportId: 'RPT-001',
      reporterId: 'user_123',
      reporterName: 'John Doe',
      reportedUserId: 'owner_456',
      reportedUserName: 'Maria Maple',
      reportedUserType: 'owner',
      reportType: 'listing',
      targetId: 'listing_789',
      targetType: 'listing',
      category: 'misrepresentation',
      severity: 'medium',
      title: 'False advertising - room not as described',
      description: 'The room I rented is significantly smaller than advertised and lacks promised amenities.',
      evidence: {
        screenshots: ['https://placehold.co/400x300.png'],
        messages: [],
        documents: ['docs/rental_agreement.pdf'],
        links: [],
      },
      status: 'under_review',
      priority: 'medium',
      assignedTo: 'admin_001',
      assignedToName: 'Admin User',
      createdAt: '2024-01-25T14:30:00Z',
      updatedAt: '2024-01-26T09:15:00Z',
      actionTaken: 'none',
      notes: [],
      timeline: [],
    },
  ],
  moderationQueue: [
    {
      id: 'mod_001',
      type: 'listing',
      targetId: 'listing_101',
      targetType: 'listing',
      title: 'Suspicious pricing pattern',
      content: 'Listing shows unusually low rent for area',
      authorId: 'owner_201',
      authorName: 'Sunny Day',
      authorType: 'owner',
      reason: 'Potential fraud - pricing below market rate',
      flags: {
        autoDetected: true,
        userReports: 0,
        aiConfidence: 0.85,
        violations: ['suspicious_pricing'],
      },
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-27T08:00:00Z',
      decision: '',
      appealStatus: 'none',
    },
  ],
  analytics: {
    overview: {
      totalReports: 156,
      resolvedReports: 128,
      pendingReports: 8,
      averageResolutionTime: 48,
      reportTrends: [],
    },
    categories: {
      fraud: { total: 23, resolved: 18, pending: 2, averageResolutionTime: 72, commonReasons: ['fake_listings', 'identity_theft'] },
      harassment: { total: 12, resolved: 10, pending: 1, averageResolutionTime: 24, commonReasons: ['inappropriate_messages'] },
      misrepresentation: { total: 45, resolved: 38, pending: 3, averageResolutionTime: 36, commonReasons: ['false_advertising', 'photos_not_matching'] },
      spam: { total: 28, resolved: 25, pending: 0, averageResolutionTime: 12, commonReasons: ['duplicate_listings', 'irrelevant_content'] },
      inappropriate_content: { total: 18, resolved: 15, pending: 1, averageResolutionTime: 18, commonReasons: ['offensive_language', 'inappropriate_photos'] },
      policy_violation: { total: 25, resolved: 20, pending: 1, averageResolutionTime: 30, commonReasons: ['illegal_activities', 'prohibited_items'] },
      other: { total: 5, resolved: 2, pending: 0, averageResolutionTime: 96, commonReasons: ['miscellaneous'] },
    },
    performance: {
      resolutionRate: 82.1,
      averageResponseTime: 8.5,
      escalationRate: 12.3,
      appealRate: 5.2,
      satisfactionScore: 4.1,
    },
    workload: {
      reportsPerAdmin: [],
      busiestHours: [],
      monthlyVolume: [],
    },
  },
  auditLogs: [
    {
      id: 'audit_001',
      userId: 'admin_001',
      userName: 'Admin User',
      userRole: 'admin',
      action: 'USER_SUSPENDED',
      resource: 'user',
      resourceId: 'user_456',
      details: {
        reason: 'Multiple fraud reports',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      },
      timestamp: '2024-01-26T15:30:00Z',
      severity: 'warning',
      category: 'user_management',
      outcome: 'success',
    },
  ],
  systemHealth: {
    status: 'healthy',
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.2,
    services: [
      {
        name: 'API Server',
        status: 'up',
        responseTime: 145,
        lastCheck: '2024-01-27T11:00:00Z',
        uptime: 99.9,
        errorRate: 0.1,
      },
      {
        name: 'Database',
        status: 'up',
        responseTime: 23,
        lastCheck: '2024-01-27T11:00:00Z',
        uptime: 99.8,
        errorRate: 0.0,
      },
    ],
    resources: [
      {
        resource: 'CPU',
        usage: 45.2,
        limit: 100,
        unit: '%',
        status: 'normal',
      },
      {
        resource: 'Memory',
        usage: 68.5,
        limit: 100,
        unit: '%',
        status: 'normal',
      },
    ],
    alerts: [],
  },
  revenueAnalytics: {
    overview: {
      totalRevenue: 2450000,
      monthlyRevenue: 245000,
      yearlyRevenue: 2450000,
      revenueGrowth: 12.5,
      projectedRevenue: 2680000,
    },
    breakdown: {
      byProperty: [],
      byCategory: [],
      byPaymentMethod: [],
    },
    trends: {
      monthly: [],
      yearly: [],
      forecast: [],
    },
    leaks: {
      detectedLeaks: [
        {
          id: 'leak_001',
          type: 'unpaid_rent',
          propertyId: 'prop_101',
          propertyName: 'Sunshine Residences',
          amount: 10500,
          detected: '2024-01-20',
          status: 'active',
          description: '3 tenants with overdue rent payments',
          evidence: ['payment_records.pdf'],
          recovery: {
            amount: 0,
            method: 'legal_action',
            status: 'pending',
          },
        },
      ],
      potentialLeaks: [],
      totalLost: 45000,
      recovered: 12000,
    },
  },
  occupancyAnalytics: {
    overview: {
      totalProperties: 38,
      totalRooms: 420,
      occupiedRooms: 330,
      averageOccupancy: 78.5,
      occupancyRate: 78.5,
      vacancyRate: 21.5,
    },
    trends: {
      monthly: [],
      seasonal: [],
      forecast: [],
    },
    breakdown: {
      byProperty: [],
      byRoomType: [],
      byLocation: [],
    },
    insights: {
      highPerforming: [],
      underPerforming: [],
      recommendations: [],
    },
  },
  userManagement: {
    overview: {
      totalUsers: 1250,
      activeUsers: 1180,
      newUsers: 45,
      suspendedUsers: 12,
      bannedUsers: 3,
    },
    users: [],
    roles: [
      {
        id: 'role_admin',
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['all'],
        userCount: 2,
      },
      {
        id: 'role_moderator',
        name: 'Moderator',
        description: 'Content moderation and user management',
        permissions: ['moderate_content', 'manage_users', 'view_reports'],
        userCount: 5,
      },
    ],
    permissions: [
      {
        id: 'perm_all',
        name: 'All Access',
        description: 'Complete system access',
        category: 'system',
        roles: ['admin'],
      },
    ],
    activities: [],
  },
};

export const adminDashboardCRUD = {
  createReport: (reportData: Partial<UserReport>) => ({
    id: `report_${Date.now()}`,
    ...reportData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as UserReport),

  updateReport: (reportId: string, updates: Partial<UserReport>) => ({
    id: reportId,
    ...updates,
    updatedAt: new Date().toISOString(),
  } as UserReport),

  resolveReport: (reportId: string, resolution: string, actionTaken: string) => ({
    id: reportId,
    status: 'resolved' as const,
    resolution,
    actionTaken,
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as UserReport),

  suspendUser: (userId: string, reason: string, duration: number) => ({
    userId,
    action: 'suspend',
    reason,
    duration,
    timestamp: new Date().toISOString(),
  }),

  banUser: (userId: string, reason: string) => ({
    userId,
    action: 'ban',
    reason,
    timestamp: new Date().toISOString(),
  }),

  createSystemAlert: (alertData: Partial<SystemAlert>) => ({
    id: `alert_${Date.now()}`,
    ...alertData,
    createdAt: new Date().toISOString(),
    acknowledged: false,
    resolved: false,
  } as SystemAlert),

  acknowledgeAlert: (alertId: string, adminId: string) => ({
    id: alertId,
    acknowledged: true,
    acknowledgedBy: adminId,
    acknowledgedAt: new Date().toISOString(),
  } as SystemAlert),
};
