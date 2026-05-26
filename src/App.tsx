import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import IdentitiesPage from "./pages/IdentitiesPage";
import IdentityDetailPage from "./pages/IdentityDetailPage";
import PaymentsPage from "./pages/PaymentsPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#FFFFFF",
            color: "#212121",
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "500",
            padding: "16px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)",
          },
          success: { 
            iconTheme: { primary: "#4CAF50", secondary: "#fff" },
            style: { borderLeft: "4px solid #4CAF50" }
          },
          error: { 
            iconTheme: { primary: "#F44336", secondary: "#fff" },
            style: { borderLeft: "4px solid #F44336" }
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route path="properties" element={<PropertiesPage />} />

          <Route path="properties/:id" element={<PropertyDetailPage />} />

          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="identities" element={<IdentitiesPage />} />
          <Route path="identities/:id" element={<IdentityDetailPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}