export interface AdminAnalyticsDto {
  totalUsers?: number;
  usersGrowthPercentage?: number;
  totalNurses?: number;
  nursesGrowthPercentage?: number;
  totalBookings?: number;
  bookingsGrowthPercentage?: number;
  growthPeriodLabel?: string;
  activeUsers?: number;
  revenueAnalytics?: RevenueWeeklyDto[];
  bookingStatus?: BookingStatusDto;
  topServices?: TopServiceDto[];
}

export interface AdminDocumentDto {
  id?: string;
  userId?: string;
  documentType?: string;
  fileUrl?: string;
  status?: string;
  rejectionReason?: string;
  createdAt?: string;
  reviewedAt?: string;
}

export interface AdminPatientUpdateDto {
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface AdminProviderFilterInput {
  status?: string;
  filter?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface AdminProviderListDto {
  id?: string;
  fullName?: string;
  email?: string;
  accountStatus?: string;
  ratingAverage?: number;
  ratingCount?: number;
  isAvailable?: boolean;
  createdAt?: string;
  isAccountActive?: boolean;
}

export interface BookingStatusDto {
  completed?: number;
  pending?: number;
  cancelled?: number;
  successRate?: number;
}

export interface RevenueWeeklyDto {
  weekName?: string;
  amount?: number;
}

export interface TopServiceDto {
  serviceId?: string;
  serviceName?: string;
  appointmentCount?: number;
}
