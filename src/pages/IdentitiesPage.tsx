import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck, RefreshCw, Phone, Mail, ChevronRight, XCircle,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { identitiesApi } from "../api/client";
import type { IdentityReviewItem, IdentityStatus } from "../types/identity";
import { format } from "date-fns";

// Status badge helper

function identityBadge(status: IdentityStatus) {
  switch (status) {
    case "pending":   return <Badge variant="warning" label="Pending" />;
    case "approved":  return <Badge variant="success" label="Approved" />;
    case "rejected":  return <Badge variant="rejected" label="Rejected" />;
    default:          return <Badge variant="neutral"  label="Not Submitted" />;
  }
}

// Page

export default function IdentitiesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<IdentityReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await identitiesApi.listPending();
      setItems(data);
    } catch {
      setError("Failed to load identity submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="ID Verification"
        subtitle={`${items.length} pending submission${items.length !== 1 ? "s" : ""}`}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <XCircle className="w-12 h-12 text-error mb-4" />
            <p className="text-text-primary font-semibold">{error}</p>
            <Button variant="outline" size="sm" onClick={load} className="mt-4">
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <UserCheck className="w-14 h-14 text-success mb-4" />
            <p className="text-lg font-bold text-text-primary">All caught up!</p>
            <p className="text-sm text-text-secondary mt-1">
              No pending identity submissions to review.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/identities/${item.id}`)}
                className="w-full text-left bg-surface rounded-2xl p-5 border border-grey-light/30 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary truncate">
                        {item.full_name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <Mail className="w-3 h-3" />
                          {item.email}
                        </span>
                        {item.phone_number && (
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <Phone className="w-3 h-3" />
                            {item.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {identityBadge(item.identity_status)}
                    <ChevronRight className="w-4 h-4 text-grey group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* ID type + date */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-grey-light/30 text-xs text-text-secondary">
                  {item.means_of_identification && (
                    <span className="font-medium text-text-primary">
                      {item.means_of_identification}
                    </span>
                  )}
                  {item.identity_submitted_at && (
                    <span>
                      Submitted {format(new Date(item.identity_submitted_at), "dd MMM yyyy, hh:mm a")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
