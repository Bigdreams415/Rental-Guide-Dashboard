import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Building2, Bed, Bath,
  Ruler, Eye, Calendar, CheckCircle, XCircle,
  FileText, Image as ImageIcon, Video, ChevronLeft, ChevronRight,
  Download, Share2,
  AlertCircle, Shield, FileCheck, History,
  ExternalLink, MessageCircle,
  Star, User, Phone, Mail
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge, verificationBadge, statusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { propertiesApi } from "../api/client";
import type { Property, OwnershipDocument } from "../types/property";
import { format } from "date-fns";
import { clsx } from "clsx";
import toast from "react-hot-toast";

// ─── Approve / Reject Modal ────────────────────────────────────────────────────

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

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onConfirm(notes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale">
        {/* Header with gradient */}
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
                {isReject ? "Reject Listing" : "Approve Listing"}
              </h3>
              <p className="text-sm text-text-secondary">
                Step {step} of 2
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-grey-light/30">
          <div
            className={clsx(
              "h-full transition-all duration-300",
              isReject ? "bg-error" : "bg-success"
            )}
            style={{ width: `${step * 50}%` }}
          />
        </div>

        <div className="p-6">
          {step === 1 ? (
            // Step 1: Confirmation
            <div className="text-center">
              <AlertCircle className={clsx(
                "w-16 h-16 mx-auto mb-4",
                isReject ? "text-error" : "text-success"
              )} />
              <p className="text-text-primary mb-2">
                Are you sure you want to {action} this property?
              </p>
              <p className="text-sm text-text-secondary">
                {isReject
                  ? "The owner will be notified and the listing will be removed."
                  : "This property will go live on the platform immediately."}
              </p>
            </div>
          ) : (
            // Step 2: Notes
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-1.5">
                {isReject ? "Reason for rejection *" : "Verification notes (optional)"}
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isReject
                  ? "e.g., Document verification failed, incomplete information..."
                  : "e.g., All documents verified, photos approved..."}
                className="w-full px-4 py-3 rounded-xl border border-grey-light/50 bg-background text-sm text-text-primary placeholder-grey focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={isReject ? "danger" : "success"}
              loading={loading}
              onClick={handleNext}
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

// ─── Document Display with enhanced UI ─────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  document_type: "Document Type",
  co_number: "C of O Number",
  file_number: "File Number",
  plot_number: "Plot Number",
  state_of_issue: "State of Issue",
  date_of_issue: "Date of Issue",
  issuing_ministry: "Issuing Ministry",
  registration_number: "Registration Number",
  grantor_name: "Grantor Name",
  grantee_name: "Grantee Name",
  date_of_assignment: "Date of Assignment",
  land_registry: "Land Registry",
  consideration: "Purchase Price (₦)",
  landlord_name: "Landlord Name",
  landlord_phone: "Landlord Phone",
  rent_start_date: "Start Date",
  rent_end_date: "End Date",
  annual_rent: "Annual Rent (₦)",
  agreement_number: "Agreement Number",
  authorizer_name: "Authorizer",
  authorizer_relationship: "Relationship",
  date_issued: "Date Issued",
  authorized_purpose: "Purpose",
  notarized_by: "Notarized By",
  survey_plan_number: "Survey Plan No.",
  surveyor_name: "Surveyor Name",
  surcon_number: "SURCON No.",
  date_of_survey: "Date of Survey",
  surveyor_general_office: "Surveyor-General Office",
  beacon_numbers: "Beacon Numbers",
  consent_number: "Consent Number",
  state: "State",
  related_co_number: "Related C of O",
  receipt_number: "Receipt Number",
  seller_name: "Seller Name",
  seller_phone: "Seller Phone",
  date_of_purchase: "Date of Purchase",
  amount_paid: "Amount Paid (₦)",
  witnesses: "Witnesses",
  approval_number: "Approval Number",
  issuing_authority: "Issuing Authority",
  date_of_approval: "Date of Approval",
  local_govt_area: "LGA",
  approval_type: "Approval Type",
  attorney_name: "Attorney Name",
  grantor_name2: "Grantor Name",
  date_executed: "Date Executed",
  poa_type: "POA Type",
  donor_name: "Donor Name",
  donee_name: "Donee Name",
  date_of_gift: "Date of Gift",
  relationship: "Relationship",
  family_name: "Family Name",
  family_head_name: "Family Head",
  family_head_phone: "Family Head Phone",
  date_of_consent: "Date of Consent",
  num_signatories: "Number of Signatories",
  witnessed_by: "Witnessed By",
  document_number: "Document Number",
  issued_by: "Issued By",
};

function DocumentCard({ doc }: { doc: OwnershipDocument }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(doc).filter(([, v]) => v && String(v).trim());
  const displayEntries = expanded ? entries : entries.slice(0, 4);

  return (
    <div className="bg-gradient-to-br from-background to-surface rounded-xl border border-grey-light/50 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary">{doc.document_type}</p>
            <p className="text-[10px] text-text-secondary">Document ID: {doc.id?.slice(0, 8)}</p>
          </div>
        </div>
        <Badge variant="info" label="Verified" dot={false} size="sm" />
      </div>

      <dl className="grid grid-cols-1 gap-2">
        {displayEntries
          .filter(([k]) => k !== "document_type" && k !== "id")
          .map(([key, val]) => (
            <div key={key} className="flex gap-2 items-start text-sm">
              <dt className="text-xs text-text-secondary w-32 shrink-0 pt-px">
                {FIELD_LABELS[key] ?? key.replace(/_/g, " ")}:
              </dt>
              <dd className="text-xs font-medium text-text-primary">{String(val)}</dd>
            </div>
          ))}
      </dl>

      {entries.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
        >
          {expanded ? "Show less" : `Show ${entries.length - 4} more fields`}
          <ChevronRight className={clsx("w-3 h-3 transition-transform", expanded && "rotate-90")} />
        </button>
      )}
    </div>
  );
}

// ─── Image Gallery with enhanced UI ────────────────────────────────────────────

function Gallery({ images }: { images: Property["images"] }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) return null;

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-grey-dark to-grey aspect-video group">
        <img
          src={images[idx].image_url}
          alt={images[idx].caption ?? "Property image"}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
          onClick={() => setLightbox(true)}
        />
        
        {/* Caption overlay */}
        {images[idx].caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs px-4 py-3">
            {images[idx].caption}
          </div>
        )}

        {/* Image count badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">
          {idx + 1} / {images.length}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIdx(i)}
            className={clsx(
              "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all",
              "hover:ring-2 hover:ring-primary hover:scale-105",
              i === idx ? "ring-2 ring-primary scale-105" : "opacity-70"
            )}
          >
            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={images[idx].image_url}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
            onClick={() => setLightbox(false)}
          >
            <XCircle className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
}

// ─── Spec Chip with enhanced UI ────────────────────────────────────────────────

function Spec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-br from-background to-surface rounded-xl px-4 py-3 border border-grey-light/50 hover:border-primary/30 hover:shadow-md transition-all group">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
        <Icon className="w-4 h-4 text-primary group-hover:text-white" />
      </div>
      <div>
        <p className="text-[10px] text-text-secondary uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

// ─── Timeline Item ─────────────────────────────────────────────────────────────

function TimelineItem({
  icon: Icon,
  title,
  description,
  time,
  status,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  status?: 'completed' | 'pending' | 'failed';
}) {
  return (
    <div className="flex gap-3">
      <div className="relative">
        <div className={clsx(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          status === 'completed' && "bg-success/10",
          status === 'pending' && "bg-warning/10",
          status === 'failed' && "bg-error/10",
          !status && "bg-primary/10"
        )}>
          <Icon className={clsx(
            "w-4 h-4",
            status === 'completed' && "text-success",
            status === 'pending' && "text-warning",
            status === 'failed' && "text-error",
            !status && "text-primary"
          )} />
        </div>
        <div className="absolute top-8 left-4 w-0.5 h-12 bg-grey-light/50 -z-10 last:hidden" />
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{description}</p>
        <p className="text-[10px] text-text-secondary mt-1">{time}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"approve" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history'>('details');

  useEffect(() => {
    if (!id) return;
    propertiesApi.get(id)
      .then(setProperty)
      .catch(() => toast.error("Property not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (notes: string) => {
    if (!property || !modal) return;
    setActionLoading(true);
    try {
      const updated = modal === "approve"
        ? await propertiesApi.approve(property.id, notes)
        : await propertiesApi.reject(property.id, notes);
      setProperty(updated);
      toast.success(
        <div className="flex items-center gap-2">
          {modal === "approve" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{modal === "approve" ? "Property approved successfully!" : "Property rejected."}</span>
        </div>
      );
      setModal(null);
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Property Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Property Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-error" />
            </div>
            <p className="text-text-primary font-semibold mb-2">Property not found</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const vb = verificationBadge(property.verification_status);
  const sb = statusBadge(property.status);
  const isPending = property.verification_status === "pending_verification";

  return (
    <>
      {modal && (
        <ActionModal
          action={modal}
          onConfirm={handleAction}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      <div className="flex flex-col h-full overflow-hidden">
        <TopBar
          title="Property Details"
          subtitle={`ID: ${property.id.slice(0, 8)}... • Added ${format(new Date(property.created_at), "MMM d, yyyy")}`}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Back + Actions row */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to properties
            </button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={<Share2 className="w-4 h-4" />}>
                Share
              </Button>
              <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                Export
              </Button>
              
              {isPending && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => setModal("reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => setModal("approve")}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Header with title and status */}
          <div className="mb-6 animate-slide-in">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">{property.title}</h1>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {property.address}, {property.city}, {property.state}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Listed {format(new Date(property.created_at), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {property.view_count} views
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary mb-1">₦{property.price.toLocaleString()}</p>
                <Badge variant={vb.variant} label={vb.label} size="md" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-grey-light/50">
            {[
              { id: 'details', label: 'Details', icon: Building2 },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'history', label: 'History', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-text-secondary hover:text-primary"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left column - Images & specs */}
              <div className="xl:col-span-2 space-y-6">
                {/* Gallery */}
                {property.images.length > 0 ? (
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      Property Photos
                    </h2>
                    <Gallery images={property.images} />
                  </div>
                ) : (
                  <div className="card p-12 text-center">
                    <ImageIcon className="w-12 h-12 text-grey-light mx-auto mb-3" />
                    <p className="text-sm text-text-secondary">No images uploaded</p>
                  </div>
                )}

                {/* Description */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Description</h2>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>

                {/* Features */}
                {property.features.length > 0 && (
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-text-primary mb-3">Features & Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((f) => (
                        <span
                          key={f}
                          className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs font-medium border border-primary/10"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {property.videos.length > 0 && (
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      Video Tour
                    </h2>
                    {property.videos.map((v) => (
                      <a
                        key={v.id}
                        href={v.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline p-2 hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        {v.video_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column - Specs & meta */}
              <div className="space-y-6">
                {/* Key specs */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Key Specifications</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {property.bedrooms != null && (
                      <Spec icon={Bed} label="Bedrooms" value={property.bedrooms} />
                    )}
                    {property.bathrooms != null && (
                      <Spec icon={Bath} label="Bathrooms" value={property.bathrooms} />
                    )}
                    {property.toilets != null && (
                      <Spec icon={Building2} label="Toilets" value={property.toilets} />
                    )}
                    {property.square_meters != null && (
                      <Spec icon={Ruler} label="Area (sqm)" value={property.square_meters} />
                    )}
                    {property.plot_size && (
                      <Spec icon={Ruler} label="Plot Size" value={property.plot_size} />
                    )}
                  </div>
                </div>

                {/* Property type */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Property Type</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="info"
                      label={property.property_type.replace("_", " ")}
                      dot={false}
                    />
                    <Badge
                      variant="neutral"
                      label={property.listing_type}
                      dot={false}
                    />
                    <Badge
                      variant="neutral"
                      label={`${property.lga} LGA`}
                      dot={false}
                    />
                    {property.landmark && (
                      <Badge variant="neutral" label={`Near ${property.landmark}`} dot={false} />
                    )}
                  </div>
                </div>

                {/* Listing info */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Listing Information</h2>
                  <dl className="space-y-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-text-secondary">Owner ID</dt>
                      <dd className="text-xs font-mono font-medium text-text-primary">
                        {property.owner_id.slice(0, 8)}...
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-text-secondary">Verification Status</dt>
                      <dd><Badge variant={vb.variant} label={vb.label} size="sm" /></dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-text-secondary">Listing Status</dt>
                      <dd><Badge variant={sb.variant} label={sb.label} size="sm" /></dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-text-secondary">Featured</dt>
                      <dd>
                        {property.is_featured ? (
                          <span className="flex items-center gap-1 text-success">
                            <Star className="w-3 h-3 fill-current" /> Yes
                          </span>
                        ) : 'No'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-grey-light/50">
                      <dt className="text-xs text-text-secondary">Last Updated</dt>
                      <dd className="text-xs text-text-primary">
                        {property.updated_at
                          ? format(new Date(property.updated_at), "MMM d, yyyy")
                          : 'Never'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Contact info - if available */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-text-secondary">Property Owner</p>
                        <p className="text-sm font-medium text-text-primary">John Doe</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <Phone className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-text-secondary">Phone</p>
                        <p className="text-sm font-medium text-text-primary">+234 801 234 5678</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <Mail className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-text-secondary">Email</p>
                        <p className="text-sm font-medium text-text-primary">owner@email.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.ownership_documents.length === 0 ? (
                <div className="col-span-2 card p-12 text-center">
                  <FileText className="w-16 h-16 text-grey-light mx-auto mb-4" />
                  <p className="text-text-secondary">No ownership documents provided</p>
                </div>
              ) : (
                property.ownership_documents.map((doc, i) => (
                  <DocumentCard key={i} doc={doc} />
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card p-5 max-w-2xl">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Activity Timeline</h2>
              <div className="space-y-2">
                <TimelineItem
                  icon={CheckCircle}
                  title="Property Created"
                  description="Listing was created by owner"
                  time={format(new Date(property.created_at), "MMM d, yyyy 'at' h:mm a")}
                  status="completed"
                />
                {property.verified_at && (
                  <TimelineItem
                    icon={Shield}
                    title="Property Verified"
                    description="Listing passed verification and went live"
                    time={format(new Date(property.verified_at), "MMM d, yyyy 'at' h:mm a")}
                    status="completed"
                  />
                )}
                {property.verification_notes && property.updated_at && (
                  <TimelineItem
                    icon={MessageCircle}
                    title="Verification Notes Added"
                    description={property.verification_notes}
                    time={format(new Date(property.updated_at), "MMM d, yyyy 'at' h:mm a")}
                    status={property.verification_status === 'rejected' ? 'failed' : 'pending'}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}