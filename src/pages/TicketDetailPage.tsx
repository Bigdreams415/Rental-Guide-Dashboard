import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, LifeBuoy, Mail, User, Calendar,
  MessageSquare, CheckCircle, XCircle, Clock, Send,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge, ticketStatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ticketsApi } from "../api/client";
import type { Ticket } from "../types/ticket";
import { format, formatDistanceToNow } from "date-fns";
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
  { value: "open", label: "Open", icon: LifeBuoy },
  { value: "in_progress", label: "In Progress", icon: Clock },
  { value: "resolved", label: "Resolved", icon: CheckCircle },
  { value: "closed", label: "Closed", icon: XCircle },
];

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editReply, setEditReply] = useState("");

  useEffect(() => {
    if (!id) return;
    ticketsApi
      .get(id)
      .then((t) => {
        setTicket(t);
        setEditStatus(t.status);
        setEditReply(t.admin_reply ?? "");
      })
      .catch(() => toast.error("Ticket not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const updated = await ticketsApi.update(ticket.id, {
        status: editStatus,
        admin_reply: editReply.trim() || undefined,
      });
      setTicket(updated);
      setEditStatus(updated.status);
      setEditReply(updated.admin_reply ?? "");
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Ticket updated. User will be notified via push notification.</span>
        </div>
      );
    } catch {
      toast.error("Failed to update ticket. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Ticket Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Ticket Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-error" />
            </div>
            <p className="text-text-primary font-semibold mb-2">Ticket not found</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const tb = ticketStatusBadge(ticket.status);
  const isDirty =
    editStatus !== ticket.status ||
    (editReply.trim() || null) !== (ticket.admin_reply ?? null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Ticket Details"
        subtitle={`ID: ${ticket.id.slice(0, 8)}... • Submitted ${format(new Date(ticket.created_at), "MMM d, yyyy")}`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Back + save row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to tickets
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={<Send className="w-4 h-4" />}
            onClick={handleSave}
            loading={saving}
            disabled={!isDirty}
          >
            Save & Notify User
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — ticket content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Header card */}
            <div className="card p-5 animate-slide-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-text-primary mb-1">{ticket.subject}</h1>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="bg-grey-light/40 px-2.5 py-1 rounded-md font-medium">
                      {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge variant={tb.variant} label={tb.label} />
              </div>

              <div className="bg-background rounded-xl p-4 border border-grey-light/40">
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {ticket.message}
                </p>
              </div>
            </div>

            {/* Admin reply card */}
            <div className="card p-5 animate-slide-in" style={{ animationDelay: "60ms" }}>
              <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Admin Response
              </h2>

              {ticket.replied_at && ticket.admin_reply && (
                <div className="mb-4 p-3 bg-success/5 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-2 text-[11px] text-success font-medium mb-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Last replied {format(new Date(ticket.replied_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{ticket.admin_reply}</p>
                </div>
              )}

              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-1.5">
                Reply message
              </label>
              <textarea
                rows={5}
                value={editReply}
                onChange={(e) => setEditReply(e.target.value)}
                placeholder="Write your response to the user here..."
                className="w-full px-4 py-3 rounded-xl border border-grey-light/50 bg-background text-sm text-text-primary placeholder-grey focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                maxLength={2000}
              />
              <p className="text-[11px] text-text-secondary mt-1 text-right">
                {editReply.length}/2000
              </p>
            </div>
          </div>

          {/* Right — meta + status */}
          <div className="space-y-6">
            {/* Submitter info */}
            <div className="card p-5 animate-slide-in" style={{ animationDelay: "30ms" }}>
              <h2 className="text-sm font-semibold text-text-primary mb-4">Submitted By</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-secondary">Full name</p>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {ticket.user_full_name || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {ticket.user_email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status selector */}
            <div className="card p-5 animate-slide-in" style={{ animationDelay: "90ms" }}>
              <h2 className="text-sm font-semibold text-text-primary mb-4">Ticket Status</h2>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setEditStatus(value)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                      editStatus === value
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-background border-grey-light/50 text-text-secondary hover:border-primary/20 hover:text-text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                    {editStatus === value && (
                      <CheckCircle className="w-3.5 h-3.5 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamps */}
            <div className="card p-5 animate-slide-in" style={{ animationDelay: "120ms" }}>
              <h2 className="text-sm font-semibold text-text-primary mb-3">Timeline</h2>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-text-secondary">Submitted</dt>
                  <dd className="text-xs text-text-primary font-medium">
                    {format(new Date(ticket.created_at), "MMM d, yyyy")}
                  </dd>
                </div>
                {ticket.replied_at && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-text-secondary">Last replied</dt>
                    <dd className="text-xs text-text-primary font-medium">
                      {format(new Date(ticket.replied_at), "MMM d, yyyy")}
                    </dd>
                  </div>
                )}
                {ticket.updated_at && (
                  <div className="flex items-center justify-between pt-2 border-t border-grey-light/50">
                    <dt className="text-xs text-text-secondary">Last updated</dt>
                    <dd className="text-xs text-text-primary font-medium">
                      {format(new Date(ticket.updated_at), "MMM d, yyyy")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
