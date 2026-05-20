export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Ticket {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  category: string;
  subject: string;
  message: string;
  status: TicketStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
}
