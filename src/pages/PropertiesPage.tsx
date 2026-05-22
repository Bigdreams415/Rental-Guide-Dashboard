import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Building2, Eye, Filter,
  MapPin, Calendar, MoreVertical,
  Grid, List, RefreshCw, Download
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { Badge, verificationBadge, statusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { propertiesApi } from "../api/client";
import type { Property, VerificationStatus } from "../types/property";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface PropertiesPageProps {
  filterStatus?: VerificationStatus;
  title: string;
  subtitle: string;
  showSearch?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  house: "House",
  land: "Land",
  commercial: "Commercial",
  shop: "Shop",
  office: "Office",
  warehouse: "Warehouse",
  event_center: "Event Center",
  shortlet: "Shortlet",
};

const LISTING_LABELS: Record<string, string> = {
  rent: "For Rent",
  sale: "For Sale",
  lease: "For Lease",
  shortlet: "Short Stay",
};

// Filter options
const propertyTypes = ['All', 'House', 'Land', 'Commercial', 'Shop', 'Office'];
const listingTypes = ['All', 'For Sale', 'For Rent', 'For Lease', 'Shortlet'];
const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₦10M', min: 0, max: 10000000 },
  { label: '₦10M - ₦50M', min: 10000000, max: 50000000 },
  { label: '₦50M - ₦100M', min: 50000000, max: 100000000 },
  { label: 'Over ₦100M', min: 100000000, max: Infinity },
];

function PropertyCard({ property, onView }: { property: Property; onView: (id: string) => void }) {
  const vb = verificationBadge(property.verification_status);
  const sb = statusBadge(property.status);
  const timeAgo = formatDistanceToNow(new Date(property.created_at), { addSuffix: true });

  return (
    <div
      onClick={() => onView(property.id)}
      className="card group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-scale"
    >
      {/* Image */}
      <div className="relative h-48 rounded-t-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {property.main_image ? (
          <>
            <img
              src={property.main_image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant={vb.variant} label={vb.label} />
          {property.is_featured && (
            <Badge variant="info" label="Featured" />
          )}
        </div>
        
        {/* Price tag */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <p className="text-sm font-bold text-primary">₦{property.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {property.title}
          </h3>
          <Badge variant={sb.variant} label={sb.label} dot={false} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{property.city}, {property.state}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <span className="font-semibold text-text-primary">{property.bedrooms}</span> beds
            </span>
          )}
          {property.bathrooms && (
            <>
              <span className="w-1 h-1 rounded-full bg-grey-light" />
              <span className="flex items-center gap-1">
                <span className="font-semibold text-text-primary">{property.bathrooms}</span> baths
              </span>
            </>
          )}
          {property.square_meters && (
            <>
              <span className="w-1 h-1 rounded-full bg-grey-light" />
              <span>{property.square_meters} m²</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-grey-light/50">
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <Calendar className="w-3 h-3" />
            {timeAgo}
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
              <Eye className="w-3.5 h-3.5 text-grey hover:text-primary" />
            </button>
            <button className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
              <MoreVertical className="w-3.5 h-3.5 text-grey hover:text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  onFilterChange,
  totalCount,
}: {
  onFilterChange: (filters: any) => void;
  totalCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedListing, setSelectedListing] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState(priceRanges[0]);

  const applyFilters = () => {
    onFilterChange({
      type: selectedType,
      listing: selectedListing,
      priceRange: selectedPrice,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={<Filter className="w-4 h-4" />}
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(isOpen && "bg-primary/10 border-primary/30")}
        >
          Filters
        </Button>
        
        <div className="text-xs text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{totalCount}</span> properties
        </div>
      </div>

      {/* Filter dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-grey-light/50 p-4 z-10 animate-scale">
          <h3 className="font-semibold text-text-primary text-sm mb-3">Filter Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1.5">
                Property Type
              </label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={clsx(
                      "px-3 py-1.5 text-xs rounded-lg transition-all",
                      selectedType === type
                        ? "bg-primary text-white shadow-sm"
                        : "bg-grey-light/30 text-text-secondary hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1.5">
                Listing Type
              </label>
              <div className="flex flex-wrap gap-2">
                {listingTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedListing(type)}
                    className={clsx(
                      "px-3 py-1.5 text-xs rounded-lg transition-all",
                      selectedListing === type
                        ? "bg-primary text-white shadow-sm"
                        : "bg-grey-light/30 text-text-secondary hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1.5">
                Price Range
              </label>
              <select
                value={priceRanges.indexOf(selectedPrice)}
                onChange={(e) => setSelectedPrice(priceRanges[Number(e.target.value)])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-light/50 bg-background focus:outline-none focus:border-primary transition-colors"
              >
                {priceRanges.map((range, index) => (
                  <option key={index} value={index}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-grey-light/50">
            <Button
              variant="primary"
              size="sm"
              onClick={applyFilters}
              className="flex-1"
            >
              Apply Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage({ filterStatus, title, subtitle, showSearch }: PropertiesPageProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    type: 'All',
    listing: 'All',
    priceRange: priceRanges[0],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data: Property[];
      if (filterStatus === "pending_verification") {
        data = await propertiesApi.listPending(0, 100);
      } else if (filterStatus) {
        // Pass verification_status to the backend so rejected/verified tabs
        // actually return the right rows (not just from the public verified list)
        data = await propertiesApi.list({ limit: 100, verification_status: filterStatus });
      } else {
        data = await propertiesApi.list({ limit: 100 });
      }
      setProperties(data);
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...properties];

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }

    // Apply type filter
    if (filters.type !== 'All') {
      filtered = filtered.filter(p =>
        p.property_type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Apply listing filter
    if (filters.listing !== 'All') {
      const listingMap: Record<string, string> = {
        'For Sale': 'sale',
        'For Rent': 'rent',
        'For Lease': 'lease',
        'Shortlet': 'shortlet',
      };
      const listingValue = listingMap[filters.listing];
      if (listingValue) {
        filtered = filtered.filter(p => p.listing_type === listingValue);
      }
    }

    // Apply price filter
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    setFilteredProperties(filtered);
  }, [properties, search, filters, filterStatus]);

  const handleExport = () => {
    toast.success("Export started. You'll be notified when it's ready.");
  };

  const handleRefresh = () => {
    load();
    toast.success("Properties refreshed");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={title} subtitle={subtitle} showSearch={showSearch} />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FilterBar onFilterChange={setFilters} totalCount={filteredProperties.length} />
            
            <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border border-grey-light/50">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "p-2 rounded-md transition-all",
                  viewMode === 'grid'
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2 rounded-md transition-all",
                  viewMode === 'list'
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Search bar (if not in TopBar) */}
        {!showSearch && (
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-grey-light/50 bg-surface focus:outline-none focus:border-primary/50 focus:shadow-sm transition-all placeholder-grey"
            />
          </div>
        )}

        {/* Properties grid/list */}
        {loading ? (
          <div className="card p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-secondary">Loading properties...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No properties found</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
              {search || filters.type !== 'All' || filters.listing !== 'All'
                ? "Try adjusting your filters or search terms."
                : "Properties will appear here once they are added to the platform."}
            </p>
            {(search || filters.type !== 'All' || filters.listing !== 'All') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilters({ type: 'All', listing: 'All', priceRange: priceRanges[0] });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={(id) => navigate(`/properties/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-transparent border-b border-grey-light/50">
                    {["Property", "Type", "Location", "Price", "Status", "Verification", "Listed", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/50">
                  {filteredProperties.map((p, index) => {
                    const vb = verificationBadge(p.verification_status);
                    const sb = statusBadge(p.status);
                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/properties/${p.id}`)}
                        className="table-row-hover cursor-pointer group animate-slide-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Property */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden shrink-0">
                              {p.main_image ? (
                                <img
                                  src={p.main_image}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="w-4 h-4 text-primary/30" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate max-w-[180px]">
                                {p.title}
                              </p>
                              <p className="text-xs text-text-secondary truncate max-w-[180px]">{p.address}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-text-secondary bg-grey-light/30 px-2 py-1 rounded-md">
                            {TYPE_LABELS[p.property_type] ?? p.property_type}
                          </span>
                          <br />
                          <span className="text-[10px] text-text-secondary mt-0.5 inline-block">
                            {LISTING_LABELS[p.listing_type] ?? p.listing_type}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 text-xs text-text-secondary">
                          {p.city}, {p.state}
                          <br />
                          <span className="text-[10px]">{p.lga}</span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">
                          ₦{p.price.toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge variant={sb.variant} label={sb.label} />
                        </td>

                        {/* Verification */}
                        <td className="px-4 py-3">
                          <Badge variant={vb.variant} label={vb.label} />
                        </td>

                        {/* Listed */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-primary/10 text-grey hover:text-primary transition-colors">
                            <Eye className="w-4 h-4" />
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