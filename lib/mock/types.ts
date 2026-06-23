export type UserRole = "employee" | "admin";

export type RideType = "CAR" | "CAB";
export type RideStatus = "OPEN" | "FULL" | "CANCELLED" | "COMPLETED";
export type GenderPref = "ANY" | "MALE" | "FEMALE";
export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WAITLISTED"
  | "CANCELLED_BY_SEEKER"
  | "CANCELLED_BY_POSTER";

export type NotificationType =
  | "REQUEST_APPROVED"
  | "NEW_REQUEST"
  | "REQUEST_REJECTED"
  | "RIDE_CANCELLED"
  | "WAITLIST_PROMOTED"
  | "RIDE_REMINDER"
  | "RATING_PROMPT"
  | "BROADCAST"
  | "ADMIN_ANNOUNCEMENT";

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  homeLocality: string;
  commuteDays: string[];
  commuteTimeFrom: string;
  commuteTimeTo: string;
  avgRating: number;
  tripCount: number;
  isVerified: boolean;
  isActive: boolean;
  gender: "MALE" | "FEMALE";
}

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  colour: string;
  isAc: boolean;
  maxSeats: number;
  isActive: boolean;
}

export interface Ride {
  id: string;
  posterId: string;
  vehicleId: string | null;
  rideType: RideType;
  date: string;
  departureTime: string;
  pickupLocality: string;
  destination: string;
  availableSeats: number;
  totalSeats: number;
  status: RideStatus;
  genderPref: GenderPref;
  deptRestriction: string | null;
  isRecurring: boolean;
  recurringDays: string[];
  autoApproveDept: boolean;
  cabNote?: string;
}

export interface RideRequest {
  id: string;
  rideId: string;
  seekerId: string;
  status: RequestStatus;
  waitlistPosition: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isBroadcast: boolean;
  isSystem: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  summary: string;
  rideId?: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
  ratingRideId?: string;
}

export interface Rating {
  id: string;
  rideId: string;
  raterId: string;
  rateeId: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  rideId: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  status: "OPEN" | "RESOLVED";
  resolution?: string;
  createdAt: string;
}

export interface MockState {
  users: User[];
  vehicles: Vehicle[];
  rides: Ride[];
  requests: RideRequest[];
  messages: Message[];
  notifications: Notification[];
  ratings: Rating[];
  reports: Report[];
}

export interface SearchParams {
  date: string;
  locality: string;
  timeFrom: string;
  timeTo: string;
}
