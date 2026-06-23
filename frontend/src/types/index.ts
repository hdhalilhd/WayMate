export interface User {
  userId: string;
  fullName: string;
  email: string;
  token: string;
}

export interface LocationDto {
  lat: number;
  lng: number;
  addressText: string;
}

export interface ListingDto {
  id: string;
  userId: string;
  driverName: string;
  driverPhoto?: string;
  city: string;
  district?: string;
  driverEmailVerified: boolean;
  driverTcVerified: boolean;
  homeLocation: LocationDto;
  workLocation: LocationDto;
  morningDepartTime: string;
  eveningDepartTime: string;
  flexibilityNote?: string;
  flexibilityDaysPct: number;
  pricePerTrip: number;
  availableSeats: number;
  deviationRadiusMeters: number;
  status: string;
  createdAt: string;
  homeDistanceMeters?: number;
  workDistanceMeters?: number;
}

export interface PublicProfileDto {
  id: string;
  fullName: string;
  profilePhoto?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isTcVerified: boolean;
  createdAt: string;
  activeListingCount: number;
}

export interface MatchRequestDto {
  id: string;
  listingId: string;
  driverName: string;
  riderName: string;
  riderPhoto?: string;
  status: string;
  initialMessage?: string;
  requestedAt: string;
  conversationId?: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface ConversationDto {
  id: string;
  matchRequestId: string;
  driverId: string;
  driverName: string;
  driverPhoto?: string;
  driverEmailVerified: boolean;
  driverTcVerified: boolean;
  riderId: string;
  riderName: string;
  riderPhoto?: string;
  riderEmailVerified: boolean;
  riderTcVerified: boolean;
  matchStatus: string;
  lastMessage?: MessageDto;
}

export interface ContactDto {
  phone?: string;
  email?: string;
  isShared: boolean;
}

export interface NotificationDto {
  id: string;
  title: string;
  body: string;
  listingId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SavedSearchDto {
  id: string;
  city?: string;
  homeAddressText: string;
  workAddressText: string;
  radiusMeters: number;
  emailNotify: boolean;
  createdAt: string;
}
