
export type UserInterface = {
    id: number;
    name: string;
    profile: string;
    email: string;
    phone: string;
    role: "admin" | "agent" | "user";
    age?: number | string | null;
    gender?: string | null;
    created_at: string;
    updated_at: string;
  };

export type DigiLockerAadhaarData = {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
};

export type DigiLockerData = {
  transactionId?: string | null;
  recordId?: string | null;
  aadhaarVerificationId?: string | null;
  service?: string | null;
  status?: string | null;
  aadhaarData?: DigiLockerAadhaarData | null;
};

export interface BankInterface {
  id: number;
  bank_name: string;
  account_holder: string;
  account_name: string;
  ifsc: string;
  /** Branch address, auto-filled from the IFSC lookup. */
  bank_address?: string | null;
  /** Legacy upload, replaced by bank_document. */
  cancelled_cheque: string | null;
  bank_document_type?: string | null;
  bank_document?: string | null;
}

export type AgentInterface = {
  id: number;
  user_id: number;
  has_company?: boolean | number | null;
  company_name: string;
  cin_no?: string | null;
  gst_no?: string | null;
  company_document_type?: string | null;
  company_document?: string | null;
  about: string;
  location: string;
  experience: number;
  deals_in: string[];
  bank?: BankInterface | null;
  verification_method?: "digilocker" | "upload" | null;
  verification_status?: "pending" | "verified" | "rejected";
  aadhar_document?: string | null;
  aadhar_document_back?: string | null;
  dl_document?: string | null;
  dl_document_back?: string | null;
  digilocker_data?: DigiLockerData | null;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_profile?: string;
  created_at: string;
  updated_at: string;
};

export type PackageDayInterface = {
  id?: number;
  package_id?: number;
  day_number: number;
  description: string;
  activities: string[];
  activity_count: number;
  hotel_stars: number;
  meals: string;
};

export type PackageMediaInterface = {
  id: number;
  package_id: number;
  file_path: string;
  media_type: "image" | "video";
  sort_order: number;
  created_at: string;
};

export type LocationSuggestionInterface = {
  name: string;
  package_count: number;
};

export type TrendingDestinationInterface = {
  name: string;
  package_count: number;
  /** Lowest published price (per person) for this destination, null when none is set. */
  starting_price: number | null;
  package_type: "domestic" | "international";
  thumbnail: string | null;
  tag: string | null;
};

/** Published package totals per package type. */
export type PackageTypeCountsInterface = Record<TrendingDestinationInterface["package_type"], number>;

export type PackageInterface = {
  id: number;
  agent_id: number;
  package_type: "domestic" | "international";
  visa_required: boolean;
  package_name: string;
  /** SEO-friendly URL segment, e.g. "goa-beach-getaway". */
  slug?: string | null;
  from_location: string;
  to_location: string;
  days: number;
  nights: number;
  price?: number | null;
  location_description: string | null;
  flight_option: "included" | "excluded";
  cab_to_hotel: boolean;
  cab_to_hotel_from: "railway" | "airport" | "both";
  cab_from_hotel: boolean;
  cab_from_hotel_to: "railway" | "airport" | "both";
  status: "draft" | "published";
  thumbnail?: string | null;
  /** All image paths of the package, in display order (list endpoints only). */
  images?: string[];
  agent_company?: string;
  agent_name?: string;
  itinerary?: PackageDayInterface[];
  media?: PackageMediaInterface[];
  created_at: string;
  updated_at: string;
};

export type FaqPage = "about" | "contact" | "become_agent";

export type FaqInterface = {
  id: number;
  page: FaqPage;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactInterface = {
  id: number;
  name: string;
  message: string;
  phone: number;
  subject: string;
  created_at: string;
};

export type BookingInterface = {
  id: number;
  package_id: number;
  user_id?: number | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  travel_date: string;
  guests: number;
  basePrice?: number | null;
  convenienceFee?: number | null;
  coupon_code?: string | null;
  amount?: number | null;
  advance_amount?: number | null;
  balance_amount?: number | null;
  balance_status?: "pending" | "paid";
  balance_payment_mode?: "platform" | "agent" | null;
  balance_paid_at?: string | null;
  status: "pending" | "confirmed" | "cancelled";
  payment_status: "pending" | "paid" | "failed";
  package_name?: string;
  package_slug?: string | null;
  agent_id?: number;
  agent_company?: string;
  /** Travel partner's GSTIN, when the agent has one on file. */
  agent_gst_no?: string | null;
  agent_mobile?: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};
export type AgentReminderSummary = {
  total: number;
  email: { sent: number; failed: number };
  sms: { sent: number; failed: number; error: string | null };
  skipped: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ReviewMediaInterface = {
  id: number;
  review_id: number;
  media_type: "image" | "video";
  file_path: string;
};

export type ReviewReplyInterface = {
  id: number;
  review_id: number;
  /** Null for guest replies. */
  user_id: number | null;
  comment: string;
  user_name: string;
  user_profile: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewInterface = {
  id: number;
  package_id: number;
  /** Null for guest reviews. */
  user_id: number | null;
  rating: number;
  comment: string;
  user_name: string;
  user_profile: string | null;
  verified: boolean;
  media: ReviewMediaInterface[];
  replies: ReviewReplyInterface[];
  created_at: string;
  updated_at: string;
};

export type ReviewSummaryInterface = {
  average: number;
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type PackageReviewsResponse = {
  summary: ReviewSummaryInterface;
  reviews: ReviewInterface[];
  my_review: ReviewInterface | null;
  /** What the logged-in viewer may do on this package's reviews. */
  permissions: {
    /** Has a paid booking for the package and has not reviewed it yet. */
    can_review: boolean;
    /** Admin, or the agent who listed the package. */
    can_reply: boolean;
  };
  pagination: PaginationMeta;
};

type AgentNotificationBase = {
  /** Unique across types, e.g. "review-12" or "booking-64". */
  id: string;
  /** The review or booking id. */
  ref_id: number;
  created_at: string;
  package_id: number;
  package_slug: string | null;
  package_name: string;
  /** Reviewer or the traveller who booked. */
  actor_name: string;
  actor_profile: string | null;
  is_unread: boolean;
};

export type ReviewNotificationInterface = AgentNotificationBase & {
  type: "review";
  rating: number;
  /** The partner has already replied to this review. */
  has_replied: boolean;
};

export type BookingNotificationInterface = AgentNotificationBase & {
  type: "booking";
  /** YYYY-MM-DD */
  travel_date: string;
  guests: number;
  amount: number;
};

/** An item in the travel partner's header bell. */
export type AgentNotificationInterface = ReviewNotificationInterface | BookingNotificationInterface;

export type AgentNotificationType = AgentNotificationInterface["type"];

export type AgentNotificationsResponse = {
  items: AgentNotificationInterface[];
  unread_count: number;
  unread_by_type: Record<AgentNotificationType, number>;
  pagination: PaginationMeta;
};

/** A finished trip the traveller is invited to review (GET /reviews/prompt). Dates are YYYY-MM-DD. */
export type ReviewPromptInterface = {
  booking_id: number;
  package_id: number;
  package_name: string;
  package_slug: string | null;
  days: number;
  travel_date: string;
  trip_end_date: string;
};
