import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2,
  XCircle, LogOut, ShieldCheck,
  ChevronLeft, ChevronRight, Settings, HelpCircle, LifeBuoy, UserCheck
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/properties", icon: Building2, label: "Properties" },
  { to: "/identities", icon: UserCheck, label: "ID Verification" },
  { to: "/tickets", icon: LifeBuoy, label: "Support Tickets" },
];

const bottomLinks = [
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/help", icon: HelpCircle, label: "Help" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, isMobile = false }: SidebarProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false); // used only for shadow effect

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  // expanded when not collapsed or on mobile (hover no longer expands width)
  const showExpanded = !collapsed || isMobile;

  return (
    <aside 
      className={clsx(
        "h-screen bg-surface/80 backdrop-blur-xl border-r border-grey-light/50 flex flex-col shrink-0 fixed left-0 top-0 z-20",
        "transition-all duration-300 ease-in-out",
        collapsed ? 'w-20' : 'w-60',
        hovered && 'shadow-2xl' // only add shadow on hover
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div className={clsx(
        "px-5 py-6 border-b border-grey-light/50 flex items-center",
        collapsed && !hovered ? 'justify-center' : 'justify-between'
      )}>
        <div className={clsx(
          "flex items-center gap-2.5",
          collapsed && !hovered && 'justify-center'
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {(showExpanded) && (
            <div className="animate-slide-in">
              <p className="font-bold text-sm text-text-primary leading-none">PropAdmin</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Management Portal</p>
            </div>
          )}
        </div>
        
        {/* Collapse toggle (desktop) and close button (mobile) */}
        {showExpanded && (
          <>
            {!isMobile && (
              <button
                onClick={onToggle}
                className="hidden md:flex w-6 h-6 rounded-lg bg-grey-light/30 hover:bg-grey-light/50 text-grey-dark items-center justify-center transition-colors"
              >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
            {isMobile && (
              <button
                onClick={onToggle}
                className="w-6 h-6 rounded-lg bg-grey-light/30 hover:bg-grey-light/50 text-grey-dark flex items-center justify-center transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto">
        {showExpanded && (
          <p className="text-[10px] font-semibold text-grey uppercase tracking-widest px-2 mb-3 animate-fade-in">
            Menu
          </p>
        )}
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "sidebar-link relative group",
                isActive && "active",
                collapsed && 'justify-center px-0'
              )
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive && 'text-primary'
                )} />
                {(showExpanded) && (
                  <span className="animate-slide-in">{label}</span>
                )}
                {!showExpanded && isActive && (
                  <span className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Bottom links - hidden on mobile to save space */}
        {!isMobile && (
          <div className="mt-auto pt-6">
            {showExpanded && (
              <p className="text-[10px] font-semibold text-grey uppercase tracking-widest px-2 mb-3 animate-fade-in">
                Support
              </p>
            )}
            {bottomLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "sidebar-link",
                    isActive && "active",
                    collapsed && 'justify-center px-0'
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {(showExpanded) && (
                  <span className="animate-slide-in">{label}</span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-grey-light/50">
        <button
          onClick={handleLogout}
          className={clsx(
            "sidebar-link w-full text-error hover:bg-error/10 hover:text-error group",
            collapsed && !hovered && 'justify-center px-0'
          )}
          title={collapsed && !hovered ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
          {(showExpanded) && (
            <span className="animate-slide-in">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}