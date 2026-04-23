import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Clock, CheckCircle, XCircle, Eye,
  ArrowRight, TrendingUp,
  Calendar, MoreVertical
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge, verificationBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { propertiesApi } from "../api/client";
import type { Property, DashboardStats } from "../types/property";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";
import { clsx } from "clsx";


function StatCard({
  label, value, icon: Icon, color, trend, trendValue, sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  sub?: string;
}) {
  return (
    <div className="stat-card group hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-text-primary">{value.toLocaleString()}</p>
            {trend && trendValue && (
              <span className={clsx(
                "text-xs font-medium flex items-center gap-0.5",
                trend === 'up' ? 'text-success' : 'text-error'
              )}>
                <TrendingUp className={clsx("w-3 h-3", trend === 'down' && "rotate-180")} />
                {trendValue}
              </span>
            )}
          </div>
          {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
        </div>
        <div className={clsx(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg",
          color
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Mini sparkline - decorative */}
      <div className="mt-3 flex items-center gap-0.5 opacity-50">
        {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
          <div
            key={i}
            className="w-1 bg-primary/30 rounded-full"
            style={{ height: `${h/2}px` }}
          />
        ))}
      </div>
    </div>
  );
}


function RecentActivity({ properties }: { properties: Property[] }) {
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-grey-light/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div>
          <h2 className="font-semibold text-text-primary text-sm">Recent Activity</h2>
          <p className="text-xs text-text-secondary mt-0.5">Latest property updates and reviews</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate("/properties")}
          className="text-primary"
        >
          View all
        </Button>
      </div>

      <div className="divide-y divide-grey-light/50">
        {properties.map((property, index) => {
          const bv = verificationBadge(property.verification_status);
          const timeAgo = formatDistanceToNow(new Date(property.created_at), { addSuffix: true });
          
          return (
            <div
              key={property.id}
              onClick={() => navigate(`/properties/${property.id}`)}
              className="px-5 py-3 flex items-center gap-4 hover:bg-primary/5 transition-all cursor-pointer group animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Thumbnail with gradient overlay */}
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden shrink-0 group-hover:shadow-md transition-shadow">
                {property.main_image ? (
                  <>
                    <img
                      src={property.main_image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {property.title}
                  </p>
                  <Badge variant={bv.variant} label={bv.label} dot={false} />
                </div>
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                  <span>₦{property.price.toLocaleString()}</span>
                  <span className="w-1 h-1 rounded-full bg-grey-light" />
                  <span>{property.city}, {property.state}</span>
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-text-secondary flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {timeAgo}
                  </span>
                  <span className="text-[10px] text-text-secondary flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {property.view_count || 0} views
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-grey hover:text-primary" />
                </button>
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-grey hover:text-primary" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const navigate = useNavigate();
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingData, verifiedData] = await Promise.all([
          propertiesApi.listPending(0, 100),
          propertiesApi.list({ limit: 100 }),
        ]);
        
        // Sort by date and take latest 5
        const allProperties = [...pendingData, ...verifiedData];
        const sorted = allProperties.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setRecentProperties(sorted.slice(0, 5));
        setStats({
          total: allProperties.length,
          pending: pendingData.length,
          verified: verifiedData.length,
          rejected: 0, // This would come from a separate endpoint
        });
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Calculate trend values (mock data - replace with real calculations)
  const pendingTrend = stats.pending > 10 ? 'up' : 'down';
  const pendingTrendValue = stats.pending > 10 ? '+12%' : '-5%';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Dashboard"
        subtitle="Welcome back, Admin"
        showSearch
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Timeframe selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-surface rounded-lg p-1 border border-grey-light/50">
            {(['today', 'week', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                  timeframe === t
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-text-secondary">
            Last updated: {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <StatCard
            label="Total Listings"
            value={stats.total}
            icon={Building2}
            color="bg-gradient-to-br from-primary to-primary-dark"
            trend="up"
            trendValue="+8.2%"
            sub="vs last month"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="bg-gradient-to-br from-warning to-orange-500"
            trend={pendingTrend}
            trendValue={pendingTrendValue}
            sub="Needs attention"
          />
          <StatCard
            label="Verified"
            value={stats.verified}
            icon={CheckCircle}
            color="bg-gradient-to-br from-success to-green-600"
            trend="up"
            trendValue="+15%"
            sub="Live on platform"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="bg-gradient-to-br from-error to-red-600"
            sub="Did not pass"
          />
        </div>


        {/* Recent Activity */}
        {loading ? (
          <div className="card p-8">
            <div className="flex items-center justify-center gap-3 text-text-secondary">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading dashboard data...</span>
            </div>
          </div>
        ) : recentProperties.length > 0 ? (
          <RecentActivity properties={recentProperties} />
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No recent activity</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Properties and updates will appear here as they are added to the platform.
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/properties')}
            >
              View All Properties
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}