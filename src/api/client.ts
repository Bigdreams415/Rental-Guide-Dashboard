import axios from "axios";
import type { Property, PropertyFilters, AuthToken, LoginCredentials, AdminUser } from "../types/property";
import type { Ticket, TicketListResponse } from "../types/ticket";
import type { IdentityReviewItem } from "../types/identity";

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (creds: LoginCredentials): Promise<AuthToken> => {
    // Admin-only endpoint — rejects users without admin_access capability
    const form = new URLSearchParams();
    form.append("username", creds.email);
    form.append("password", creds.password);
    const { data } = await api.post<AuthToken>("/admin/auth/token", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },
};

// ─── Properties ───────────────────────────────────────────────────────────────

export const propertiesApi = {
  // Public list (verified only unless show_pending=true)
  list: async (filters: PropertyFilters = {}): Promise<Property[]> => {
    const { data } = await api.get<Property[]>("/properties/", { params: filters });
    return data;
  },

  // Admin: pending only
  listPending: async (skip = 0, limit = 50): Promise<Property[]> => {
    const { data } = await api.get<Property[]>("/properties/admin/pending", {
      params: { skip, limit },
    });
    return data;
  },

  // Single property
  get: async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
  },

  // Approve
  approve: async (id: string, notes?: string): Promise<Property> => {
    const { data } = await api.post<Property>(`/properties/admin/${id}/verify`, {
      action: "approve",
      notes: notes ?? null,
    });
    return data;
  },

  // Reject
  reject: async (id: string, notes: string): Promise<Property> => {
    const { data } = await api.post<Property>(`/properties/admin/${id}/verify`, {
      action: "reject",
      notes,
    });
    return data;
  },
};

// ─── Admin Users ─────────────────────────────────────────────────────────────

export const adminApi = {
  getUser: async (userId: string): Promise<AdminUser> => {
    const { data } = await api.get<AdminUser>(`/admin/users/${userId}`);
    return data;
  },

  // Returns a full URL to stream an ownership document (auth is auto-attached by axios)
  documentUrl: (propertyId: string, relativePath: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const filename = relativePath.split("/").pop() ?? relativePath;
    return `${base}/properties/${propertyId}/documents/${filename}`;
  },
};

// ─── Identity Verification (Admin) ───────────────────────────────────────────

export const identitiesApi = {
  listPending: async (skip = 0, limit = 50): Promise<IdentityReviewItem[]> => {
    const { data } = await api.get<IdentityReviewItem[]>("/admin/identity/pending", {
      params: { skip, limit },
    });
    return data;
  },

  get: async (userId: string): Promise<IdentityReviewItem> => {
    const { data } = await api.get<IdentityReviewItem>(`/admin/identity/${userId}`);
    return data;
  },

  approve: async (userId: string, notes?: string): Promise<IdentityReviewItem> => {
    const { data } = await api.post<IdentityReviewItem>(`/admin/identity/${userId}/review`, {
      action: "approve",
      notes: notes ?? null,
    });
    return data;
  },

  reject: async (userId: string, notes: string): Promise<IdentityReviewItem> => {
    const { data } = await api.post<IdentityReviewItem>(`/admin/identity/${userId}/review`, {
      action: "reject",
      notes,
    });
    return data;
  },

  // Returns a full URL to stream the identity document (auth token auto-attached by axios interceptor)
  documentUrl: (userId: string, relativePath: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const filename = relativePath.split("/").pop() ?? relativePath;
    return `${base}/identity/document/${userId}/${filename}`;
  },

  selfieUrl: (userId: string, relativePath: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const filename = relativePath.split("/").pop() ?? relativePath;
    return `${base}/identity/document/${userId}/${filename}`;
  },
};

// ─── Support Tickets (Admin) ──────────────────────────────────────────────────

export const ticketsApi = {
  list: async (params: { status?: string; skip?: number; limit?: number } = {}) => {
    const { data } = await api.get<TicketListResponse>("/admin/support/tickets", { params });
    return data;
  },
  get: async (id: string): Promise<Ticket> => {
    const { data } = await api.get<Ticket>(`/admin/support/tickets/${id}`);
    return data;
  },
  update: async (id: string, body: { status?: string; admin_reply?: string }): Promise<Ticket> => {
    const { data } = await api.patch<Ticket>(`/admin/support/tickets/${id}`, body);
    return data;
  },
};

export default api;