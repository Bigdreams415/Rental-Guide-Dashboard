import { Bell, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export function TopBar({ title, subtitle, showSearch = false }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-grey-light/50 px-6 flex items-center justify-center md:justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="animate-slide-in">
          <h1 className="text-xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search - optional */}
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-9 pr-4 py-2 text-sm rounded-xl border border-grey-light/50 bg-background/50 focus:bg-surface focus:outline-none focus:border-primary/50 transition-all placeholder-grey"
            />
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl border border-grey-light/50 flex items-center justify-center hover:bg-primary/5 hover:border-primary/20 transition-all group"
          >
            <Bell className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-grey-light/50 overflow-hidden z-50 animate-scale">
              <div className="p-3 border-b border-grey-light/50 bg-gradient-to-r from-primary/5 to-transparent">
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 hover:bg-primary/5 transition-colors cursor-pointer border-b border-grey-light/50 last:border-0">
                    <p className="text-sm font-medium text-text-primary">New property pending review</p>
                    <p className="text-xs text-text-secondary mt-1">2 minutes ago</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-grey-light/50">
                <button className="w-full text-xs text-primary font-medium py-1.5 hover:bg-primary/5 rounded-lg transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:bg-primary/5 p-1.5 rounded-xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <ChevronDown className={clsx(
              "w-4 h-4 text-text-secondary transition-transform duration-200",
              showProfile && "rotate-180"
            )} />
          </button>

          {/* Profile dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-xl border border-grey-light/50 overflow-hidden z-50 animate-scale">
              <div className="p-3 border-b border-grey-light/50">
                <p className="text-sm font-semibold text-text-primary">Admin User</p>
                <p className="text-xs text-text-secondary">admin@example.com</p>
              </div>
              <div className="p-2">
                {['Profile', 'Settings', 'Help'].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}