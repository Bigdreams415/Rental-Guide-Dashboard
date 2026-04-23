import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // when on mobile we don't offset content margin, on desktop adjust according to sidebar width
  const contentClass = `flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${!isMobile ? (sidebarCollapsed ? 'ml-20' : 'ml-60') : ''}`;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {(!isMobile || !sidebarCollapsed) && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />
      )}
      
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Main content */}
      <div className={contentClass}>
        {/* Mobile menu button */}
        {isMobile && sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed top-0 left-0 z-30 bg-primary text-white p-3 rounded-br-lg shadow-lg hover:bg-primary-dark transition-colors btn-scale"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <Outlet />
      </div>
    </div>
  );
}