export type TransactionStatus = 'pending' | 'in_escrow' | 'released' | 'refunded' | 'failed';
export type PayoutStatus = 'not_started' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  property_id: string;
  buyer_id: string;
  owner_id: string;
  amount: number;
  platform_fee: number;
  owner_amount: number;
  paystack_reference: string;
  authorization_url?: string;
  status: TransactionStatus;
  listing_type: string;
  paid_at?: string;
  released_at?: string;
  refunded_at?: string;
  notes?: string;
  property_title?: string;
  property_image?: string;
  property_state?: string;
  buyer_name?: string;
  owner_name?: string;
  payout_status?: PayoutStatus;
  transfer_reference?: string;
  transfer_attempts: number;
  payout_failed_reason?: string;
  payout_completed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
}
