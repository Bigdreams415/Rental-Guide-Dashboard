//  Enums 

export type PropertyType =
  | "house" | "land" | "commercial" | "shop"
  | "office" | "warehouse" | "event_center" | "shortlet";

export type ListingType = "rent" | "sale" | "lease" | "shortlet";

export type PropertyStatus =
  | "available" | "rented" | "sold" | "pending" | "unavailable" | "draft";

export type VerificationStatus =
  | "pending_verification" | "verified" | "rejected";

// Sub-models 

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_main: boolean;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface PropertyVideo {
  id: string;
  property_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  duration: number | null;
  display_order: number;
  created_at: string;
}

// Ownership document — keys vary per document type
export interface OwnershipDocument {
  document_type: string;
  file_urls?: string[]; // uploaded scan/photo files (relative paths served by the API)
  [key: string]: string | string[] | undefined; // dynamic fields: co_number, plot_number, etc.
}

// Main Property 

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  status: PropertyStatus;
  verification_status: VerificationStatus;

  // Location
  address: string;
  city: string;
  state: string;
  lga: string;
  landmark: string | null;

  // Pricing
  price: number;

  // Specs
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  square_meters: number | null;
  plot_size: string | null;

  // Features
  features: string[];

  // Media
  main_image: string | null;
  images: PropertyImage[];
  videos: PropertyVideo[];

  // Verification
  ownership_documents: OwnershipDocument[];
  verification_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;

  // Meta
  owner_id: string;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string | null;
}

// API Pagination / List \

export interface PaginatedProperties {
  items: Property[];
  total: number;
  skip: number;
  limit: number;
}

// Filter params for the list page 

export interface PropertyFilters {
  search?: string;
  state?: string;
  city?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  verification_status?: VerificationStatus;
  skip?: number;
  limit?: number;
}

// Stats (derived on frontend from list data) 

export interface DashboardStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

// Admin User (slim profile for property reviewer) 

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  profile_image: string | null;
  verification_level: string;
  is_active: boolean;
  created_at: string;
  listings_count: number;
}

// Auth

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}