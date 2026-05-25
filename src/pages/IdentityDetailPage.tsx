import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, XCircle, User,
  Phone, Mail, Shield, FileText, Camera,
  AlertCircle, Maximize2,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import api, { identitiesApi } from "../api/client";
import type { IdentityReviewItem, IdentityStatus } from "../types/identity";
import { format } from "date-fns";
import { clsx } from "clsx";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isImageFile(relativePath: string | null): boolean {
  if (!relativePath) return false;
  const ext = relativePath.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "webp"].includes(ext);
}

// ─── Action Modal ─────────────────────────────────────────────────────────────

function ActionModal({
  action, onConfirm, onCancel, loading,
}: {
  action: "approve" | "reject";
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);
  const isReject = action === "reject";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale">
        <div className={clsx(
          "px-6 py-4",
          isReject ? "bg-gradient-to-r from-error/10 to-error/5" : "bg-gradient-to-r from-success/10 to-success/5"
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isReject ? "bg-error/10" : "bg-success/10"
            )}>
              {isReject
                ? <XCircle className="w-6 h-6 text-error" />
                : <CheckCircle className="w-6 h-6 text-success" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {isReject ? "Reject Identity" : "Approve Identity"}
              </h3>
              <p className="text-sm text-text-secondary">Step {step} of 2</p>
            </div>
          </div>
        </div>

        <div className="h-1 bg-grey-light/30">
          <div
            className={clsx("h-full transition-all duration-300", isReject ? "bg-error" : "bg-success")}
            style={{ width: `${step * 50}%` }}
          />
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="text-center">
              <AlertCircle className={clsx("w-16 h-16 mx-auto mb-4", isReject ? "text-error" : "text-success")} />
              <p className="text-text-primary mb-2">
                Are you sure you want to {action} this identity?
              </p>
              <p className="text-sm text-text-secondary">
                {isReject
                  ? "The user will be notified and must resubmit their documents."
                  : "The user will gain the ability to list properties immediately."}
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-1.5">
                {isReject ? "Reason for rejection *" : "Notes (optional)"}
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isReject
                    ? "e.g., ID image unclear, details don't match, expired document..."
                    : "e.g., NIN verified, documents clear..."
                }
                className="w-full px-4 py-3 rounded-xl border border-grey-light/50 bg-background text-sm text-text-primary placeholder-grey focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={isReject ? "danger" : "success"}
              loading={loading}
              onClick={() => step === 1 ? setStep(2) : onConfirm(notes)}
              className="flex-1"
              disabled={step === 2 && isReject && !notes.trim()}
            >
              {step === 1 ? "Continue" : (isReject ? "Reject" : "Approve")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Status badge helper ──────────────────────────────────────────────────────

function identityBadge(status: IdentityStatus) {
  switch (status) {
    case "pending":   return <Badge variant="warning"  label="Pending Review" />;
    case "approved":  return <Badge variant="success"  label="Approved" />;
    case "rejected":  return <Badge variant="rejected" label="Rejected" />;
    default:          return <Badge variant="neutral"  label="Not Submitted" />;
  }
}

// ─── Inline document preview ──────────────────────────────────────────────────

function DocPreview({
  label,
  icon,
  relativePath,
  blobUrl,
  loading,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  relativePath: string | null;
  blobUrl: string | null;
  loading: boolean;
  error: boolean;
}) {
  const isPdf = !isImageFile(relativePath);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</span>
        </div>
        {blobUrl && (
          <button
            onClick={() => window.open(blobUrl, "_blank")}
            title="Open fullscreen"
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        )}
      </div>

      {!relativePath ? (
        <div className="w-full h-36 rounded-xl bg-grey-light/10 border border-grey-light/20 flex items-center justify-center">
          <p className="text-sm text-text-secondary italic">Not provided</p>
        </div>
      ) : loading ? (
        <div className="w-full h-56 rounded-xl bg-grey-light/20 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="w-full h-56 rounded-xl bg-error/5 border border-error/20 flex flex-col items-center justify-center gap-2">
          <XCircle className="w-6 h-6 text-error/50" />
          <p className="text-xs text-text-secondary">Failed to load</p>
        </div>
      ) : blobUrl ? (
        isPdf ? (
          <iframe
            src={blobUrl}
            title={label}
            className="w-full h-96 rounded-xl border border-grey-light/30"
          />
        ) : (
          <img
            src={blobUrl}
            alt={label}
            className="w-full max-h-80 object-contain rounded-xl border border-grey-light/30 bg-grey-light/10"
          />
        )
      ) : null}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IdentityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<IdentityReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<"approve" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);
  const [selfieBlobUrl, setSelfieBlobUrl] = useState<string | null>(null);
  const [docFetchLoading, setDocFetchLoading] = useState(false);
  const [selfieFetchLoading, setSelfieFetchLoading] = useState(false);
  const [docError, setDocError] = useState(false);
  const [selfieError, setSelfieError] = useState(false);

  useEffect(() => {
    if (!id) return;
    identitiesApi.get(id)
      .then(setItem)
      .catch(() => toast.error("Failed to load submission."))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch document blobs (auth via axios interceptor) once item is loaded
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    let docBlob: string | null = null;
    let selfieBlob: string | null = null;

    const fetchDoc = async () => {
      if (!item.identity_document_url) return;
      setDocFetchLoading(true);
      setDocError(false);
      try {
        const url = identitiesApi.documentUrl(item.id, item.identity_document_url);
        const { data } = await api.get<Blob>(url, { responseType: "blob" });
        const blob = URL.createObjectURL(data);
        if (!isMounted) { URL.revokeObjectURL(blob); return; }
        docBlob = blob;
        setDocBlobUrl(blob);
      } catch {
        if (isMounted) setDocError(true);
      } finally {
        if (isMounted) setDocFetchLoading(false);
      }
    };

    const fetchSelfie = async () => {
      if (!item.identity_selfie_url) return;
      setSelfieFetchLoading(true);
      setSelfieError(false);
      try {
        const url = identitiesApi.selfieUrl(item.id, item.identity_selfie_url);
        const { data } = await api.get<Blob>(url, { responseType: "blob" });
        const blob = URL.createObjectURL(data);
        if (!isMounted) { URL.revokeObjectURL(blob); return; }
        selfieBlob = blob;
        setSelfieBlobUrl(blob);
      } catch {
        if (isMounted) setSelfieError(true);
      } finally {
        if (isMounted) setSelfieFetchLoading(false);
      }
    };

    fetchDoc();
    fetchSelfie();

    return () => {
      isMounted = false;
      if (docBlob) URL.revokeObjectURL(docBlob);
      if (selfieBlob) URL.revokeObjectURL(selfieBlob);
    };
  }, [item?.id]);

  const handleAction = async (notes: string) => {
    if (!item || !actionModal) return;
    setActionLoading(true);
    try {
      const updated =
        actionModal === "approve"
          ? await identitiesApi.approve(item.id, notes || undefined)
          : await identitiesApi.reject(item.id, notes);
      setItem(updated);
      toast.success(
        actionModal === "approve"
          ? "Identity approved — user can now list properties."
          : "Identity rejected — user has been notified."
      );
      setActionModal(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Identity Review" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Identity Review" />
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <XCircle className="w-12 h-12 text-error" />
          <p className="text-text-primary font-semibold">Submission not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const isPending = item.identity_status === "pending";

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Identity Review" subtitle={item.full_name} />

      <div className="flex-1 overflow-y-auto p-6 w-full">
        {/* Back + status row */}
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {identityBadge(item.identity_status)}
        </div>

        {/* Rejection notes banner */}
        {item.identity_notes && item.identity_status === "rejected" && (
          <div className="rounded-2xl p-4 mb-5 bg-error/8 border border-error/20">
            <p className="text-xs font-semibold text-error uppercase tracking-wide mb-1">Rejection reason</p>
            <p className="text-sm text-text-primary">{item.identity_notes}</p>
          </div>
        )}

        {/* User Info */}
        <div className="bg-surface rounded-2xl p-5 border border-grey-light/30 mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">
            User Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={<User className="w-4 h-4 text-primary" />} label="Full Name" value={item.full_name} />
            <InfoRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={item.email} />
            {item.phone_number && (
              <InfoRow icon={<Phone className="w-4 h-4 text-primary" />} label="Phone" value={item.phone_number} />
            )}
            <InfoRow
              icon={<Shield className="w-4 h-4 text-primary" />}
              label="Verification Level"
              value={item.verification_level.replace(/_/g, " ")}
            />
          </div>
        </div>

        {/* ID Details */}
        <div className="bg-surface rounded-2xl p-5 border border-grey-light/30 mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">
            Identity Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary">ID Type</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                {item.means_of_identification ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">ID Number</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5 font-mono tracking-wider">
                {item.identification_number ?? "—"}
              </p>
            </div>
            {item.identity_submitted_at && (
              <div>
                <p className="text-xs text-text-secondary">Submitted</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">
                  {format(new Date(item.identity_submitted_at), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documents — inline preview */}
        <div className="bg-surface rounded-2xl p-5 border border-grey-light/30 mb-6">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-5">
            Uploaded Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocPreview
              label="Selfie"
              icon={<Camera className="w-3.5 h-3.5 text-text-secondary" />}
              relativePath={item.identity_selfie_url}
              blobUrl={selfieBlobUrl}
              loading={selfieFetchLoading}
              error={selfieError}
            />
            <DocPreview
              label="ID Document"
              icon={<FileText className="w-3.5 h-3.5 text-text-secondary" />}
              relativePath={item.identity_document_url}
              blobUrl={docBlobUrl}
              loading={docFetchLoading}
              error={docError}
            />
          </div>
        </div>

        {/* Action buttons — only shown when pending */}
        {isPending && (
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => setActionModal("reject")}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button variant="success" className="flex-1" onClick={() => setActionModal("approve")}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {actionModal && (
        <ActionModal
          action={actionModal}
          onConfirm={handleAction}
          onCancel={() => setActionModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// ─── InfoRow helper ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-semibold text-text-primary capitalize">{value}</p>
      </div>
    </div>
  );
}
