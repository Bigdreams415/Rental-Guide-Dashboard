import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, RefreshCw, Filter, ChevronDown } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge, ticketStatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ticketsApi } from "../api/client";
import type { Ticket } from "../types/ticket";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug / App issue",
  payment: "Payment issue",
  report_listing: "Report a listing",
  account: "Account issue",
  other: "Other",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await ticketsApi.list({ status: status || undefined, limit: 100 });
      setTickets(res.tickets);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(statusFilter); }, [load, statusFilter]);

  const handleRefresh = () => {
    load(statusFilter);
    toast.success("Tickets refreshed");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Support Tickets"
        subtitle="View and manage user-submitted support requests"
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status filter */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setFilterOpen((o) => !o)}
              className={clsx(filterOpen && "bg-primary/10 border-primary/30")}
            >
              {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All statuses"}
              <ChevronDown className={clsx("w-3.5 h-3.5 ml-1 transition-transform", filterOpen && "rotate-180")} />
            </Button>
            {filterOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-surface rounded-xl shadow-xl border border-grey-light/50 overflow-hidden z-10 animate-scale">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setFilterOpen(false); }}
                    className={clsx(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      statusFilter === opt.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-secondary hover:bg-grey-light/30 hover:text-text-primary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary">
              Showing <span className="font-semibold text-text-primary">{total}</span> ticket{total !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-secondary">Loading tickets...</p>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LifeBuoy className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No tickets found</h3>
            <p className="text-sm text-text-secondary">
              {statusFilter
                ? "No tickets match this status filter."
                : "No support tickets have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-transparent border-b border-grey-light/50">
                    {["Subject", "Category", "User", "Status", "Submitted", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/50">
                  {tickets.map((ticket, index) => {
                    const tb = ticketStatusBadge(ticket.status);
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="table-row-hover cursor-pointer group animate-slide-in"
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-text-primary group-hover:text-primary transition-colors max-w-[260px] truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 max-w-[260px]">
                            {ticket.message}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-text-secondary bg-grey-light/30 px-2 py-1 rounded-md">
                            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-text-primary font-medium truncate max-w-[160px]">
                            {ticket.user_full_name || "—"}
                          </p>
                          <p className="text-xs text-text-secondary truncate max-w-[160px]">
                            {ticket.user_email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={tb.variant} label={tb.label} />
                        </td>
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-primary/10 text-grey hover:text-primary transition-colors">
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
