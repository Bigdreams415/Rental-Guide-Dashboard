import { useEffect, useState, useCallback } from "react";
import {
  CreditCard, RefreshCw, ShieldCheck, Undo2,
  CheckCircle2, Clock, AlertCircle, TrendingUp, RotateCcw,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge, transactionStatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { paymentsApi } from "../api/client";
import type { Transaction, TransactionStatus } from "../types/transaction";
import { formatDistanceToNow, format } from "date-fns";
import { clsx } from "clsx";
import toast from "react-hot-toast";

type Tab = "all" | "in_escrow" | "released" | "refunded" | "payout_failed";

const TABS: { id: Tab; label: string; icon: React.ElementType; statusFilter?: TransactionStatus }[] = [
  { id: "all",          label: "All Transactions", icon: CreditCard },
  { id: "in_escrow",    label: "In Escrow",        icon: Clock,        statusFilter: "in_escrow" },
  { id: "released",     label: "Released",          icon: CheckCircle2, statusFilter: "released" },
  { id: "refunded",     label: "Refunded",          icon: Undo2,        statusFilter: "refunded" },
  { id: "payout_failed", label: "Payout Failed",   icon: AlertCircle,  statusFilter: "released" },
];

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}

function StatsCard({ label, value, sub, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-text-primary mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Stats derived from all transactions
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const loadAll = useCallback(async () => {
    try {
      const res = await paymentsApi.list({ limit: 1000 });
      setAllTransactions(res.items);
    } catch {
      // stats unavailable, non-critical
    }
  }, []);

  const load = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const tab_def = TABS.find(t => t.id === tab)!;
      const res = await paymentsApi.list({
        status: tab_def.statusFilter,
        limit: 100,
      });
      // Payout Failed tab: filter released transactions where payout_status = failed
      const items = tab === "payout_failed"
        ? res.items.filter(t => t.payout_status === "failed")
        : res.items;
      setTransactions(items);
      setTotal(tab === "payout_failed" ? items.length : res.total);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeTab);
    loadAll();
  }, [activeTab, load, loadAll]);

  const handleRelease = async (tx: Transaction) => {
    if (!confirm(`Release ₦${tx.owner_amount.toLocaleString()} to ${tx.owner_name ?? "owner"}?`)) return;
    setActionLoading(tx.id);
    try {
      const updated = await paymentsApi.release(tx.id);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      setAllTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success("Funds released to owner");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Release failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryPayout = async (tx: Transaction) => {
    if (!confirm(`Retry payout of ₦${tx.owner_amount.toLocaleString()} to ${tx.owner_name ?? "owner"}?`)) return;
    setActionLoading(tx.id + "_retry");
    try {
      const updated = await paymentsApi.retryPayout(tx.id);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      setAllTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success("Payout retry initiated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Retry failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (tx: Transaction) => {
    if (!confirm(`Refund full amount of ₦${tx.amount.toLocaleString()} to ${tx.buyer_name ?? "buyer"} via Paystack?`)) return;
    setActionLoading(tx.id + "_refund");
    try {
      const updated = await paymentsApi.refund(tx.id);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      setAllTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success("Refund initiated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Refund failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Compute stats
  const escrowTxs      = allTransactions.filter(t => t.status === "in_escrow");
  const releasedTxs    = allTransactions.filter(t => t.status === "released");
  const refundedTxs    = allTransactions.filter(t => t.status === "refunded");
  const payoutFailedTxs = allTransactions.filter(t => t.payout_status === "failed");
  const totalVolume = allTransactions
    .filter(t => t.status !== "failed" && t.status !== "pending")
    .reduce((s, t) => s + t.amount, 0);
  const escrowAmount = escrowTxs.reduce((s, t) => s + t.amount, 0);
  const platformEarned = releasedTxs.reduce((s, t) => s + t.platform_fee, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Payments"
        subtitle="Monitor transactions, release escrow, and manage refunds"
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Volume"
            value={formatNaira(totalVolume)}
            sub={`${allTransactions.length} transactions`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-primary to-primary-dark"
          />
          <StatsCard
            label="In Escrow"
            value={formatNaira(escrowAmount)}
            sub={`${escrowTxs.length} pending`}
            icon={ShieldCheck}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatsCard
            label="Platform Earned"
            value={formatNaira(platformEarned)}
            sub={`From ${releasedTxs.length} released`}
            icon={CheckCircle2}
            color="bg-gradient-to-br from-success to-green-600"
          />
          <StatsCard
            label="Refunded"
            value={formatNaira(refundedTxs.reduce((s, t) => s + t.amount, 0))}
            sub={`${refundedTxs.length} refunds`}
            icon={AlertCircle}
            color="bg-gradient-to-br from-accent to-blue-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-grey-light/20 p-1 rounded-xl w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "in_escrow" && escrowTxs.length > 0 && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-warning text-white text-[10px] font-bold px-1 rounded-full">
                    {escrowTxs.length}
                  </span>
                )}
                {tab.id === "payout_failed" && payoutFailedTxs.length > 0 && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-error text-white text-[10px] font-bold px-1 rounded-full">
                    {payoutFailedTxs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Refresh */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{total}</span> transaction{total !== 1 ? "s" : ""}
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => { load(activeTab); loadAll(); toast.success("Refreshed"); }}
          >
            Refresh
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No transactions found</h3>
            <p className="text-sm text-text-secondary">
              {activeTab === "all" ? "No transactions have been made yet." : `No ${activeTab.replace("_", " ")} transactions.`}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-transparent border-b border-grey-light/50">
                    {["Property", "Buyer → Owner", "Amount", "Platform Fee", "Status", "Paid At",
                      ...(activeTab === "in_escrow" || activeTab === "payout_failed" ? ["Actions"] : [])
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/50">
                  {transactions.map((tx, index) => {
                    const badge = transactionStatusBadge(tx.status);
                    const isReleasing = actionLoading === tx.id;
                    const isRefunding = actionLoading === tx.id + "_refund";
                    const isRetrying  = actionLoading === tx.id + "_retry";
                    const isBusy = isReleasing || isRefunding || isRetrying;

                    return (
                      <tr
                        key={tx.id}
                        className="table-row-hover animate-slide-in group"
                        style={{ animationDelay: `${index * 15}ms` }}
                      >
                        {/* Property */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-text-primary group-hover:text-primary transition-colors max-w-[200px] truncate">
                            {tx.property_title ?? "—"}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            {tx.property_state ?? ""} · {tx.listing_type}
                          </p>
                          <p className="text-[10px] text-grey font-mono mt-0.5">{tx.paystack_reference}</p>
                        </td>

                        {/* Buyer → Owner */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-text-primary font-medium truncate max-w-[160px]">
                            <span className="text-text-secondary">Buyer: </span>{tx.buyer_name ?? "—"}
                          </p>
                          <p className="text-xs text-text-secondary truncate max-w-[160px] mt-0.5">
                            <span>Owner: </span>{tx.owner_name ?? "—"}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-text-primary">{formatNaira(tx.amount)}</p>
                          <p className="text-[11px] text-success mt-0.5">Owner gets {formatNaira(tx.owner_amount)}</p>
                        </td>

                        {/* Platform Fee */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-primary">{formatNaira(tx.platform_fee)}</p>
                          <p className="text-[11px] text-text-secondary mt-0.5">8%</p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge variant={badge.variant} label={badge.label} />
                          {tx.payout_status && tx.payout_status !== "not_started" && (
                            <span className={clsx(
                              "mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                              tx.payout_status === "completed" && "bg-success/10 text-green-700",
                              tx.payout_status === "processing" && "bg-warning/10 text-yellow-700",
                              tx.payout_status === "failed" && "bg-error/10 text-red-700",
                            )}>
                              {tx.payout_status === "completed" && "✓ Paid out"}
                              {tx.payout_status === "processing" && "⏳ Paying..."}
                              {tx.payout_status === "failed" && "✗ Payout failed"}
                            </span>
                          )}
                          {tx.released_at && (
                            <p className="text-[10px] text-text-secondary mt-1">
                              {format(new Date(tx.released_at), "dd MMM yyyy")}
                            </p>
                          )}
                          {tx.refunded_at && (
                            <p className="text-[10px] text-text-secondary mt-1">
                              {format(new Date(tx.refunded_at), "dd MMM yyyy")}
                            </p>
                          )}
                        </td>

                        {/* Paid At */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {tx.paid_at
                            ? formatDistanceToNow(new Date(tx.paid_at), { addSuffix: true })
                            : "—"}
                        </td>

                        {/* Actions — In Escrow tab */}
                        {activeTab === "in_escrow" && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                loading={isReleasing}
                                disabled={isBusy}
                                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                onClick={() => handleRelease(tx)}
                              >
                                Release
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                loading={isRefunding}
                                disabled={isBusy}
                                icon={<Undo2 className="w-3.5 h-3.5" />}
                                onClick={() => handleRefund(tx)}
                              >
                                Refund
                              </Button>
                            </div>
                          </td>
                        )}

                        {/* Actions — Payout Failed tab */}
                        {activeTab === "payout_failed" && (
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                loading={isRetrying}
                                disabled={isBusy}
                                icon={<RotateCcw className="w-3.5 h-3.5" />}
                                onClick={() => handleRetryPayout(tx)}
                              >
                                Retry Payout
                              </Button>
                              {tx.payout_failed_reason && (
                                <p className="text-[10px] text-error max-w-[180px] leading-tight">
                                  {tx.payout_failed_reason}
                                </p>
                              )}
                            </div>
                          </td>
                        )}
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
