export type IdentityStatus =
  | 'not_submitted'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface IdentityReviewItem {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  means_of_identification: string | null;
  identification_number: string | null;
  identity_document_url: string | null;
  identity_selfie_url: string | null;
  identity_submitted_at: string | null;
  identity_status: IdentityStatus;
  identity_notes: string | null;
  verification_level: string;
}
