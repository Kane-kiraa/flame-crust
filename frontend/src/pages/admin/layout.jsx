import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/food/navbar";
import { CartDrawer } from "@/components/food/cart-drawer";
import { Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "./sidebar.jsx";
import AdminResourcePage from "./resource-page.jsx";
import AdminDashboard from "./dashboard.jsx";

const adminResources = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "products", label: "Products", icon: "📦" },
  { key: "product_options", label: "Options", icon: "⚙️" },
  { key: "product_variants", label: "Variants", icon: "🧩" },
  { key: "categories", label: "Categories", icon: "📂" },
  { key: "customers", label: "Customers", icon: "👥" },
  { key: "orders", label: "Orders", icon: "📋" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "drivers", label: "Drivers", icon: "🚗" },
  { key: "coupons", label: "Coupons", icon: "🎟️" },
  { key: "users", label: "Users", icon: "👤" },
  { key: "roles", label: "Roles", icon: "🛡️" },
  { key: "reviews", label: "Reviews", icon: "⭐" },
  { key: "audit_logs", label: "Audit Logs", icon: "📝" },
];

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // If not authenticated, we could return null or a loader, but the redirect will handle it.
  if (!localStorage.getItem("adminAuth")) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      <div className="flex-1 flex pt-18 sm:pt-20">
        {/* Desktop Sidebar */}
        <AdminSidebar resources={adminResources} />

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed top-0 left-0 bottom-0 z-50 w-64 md:hidden">
              <AdminSidebar
                resources={adminResources}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Mobile sidebar toggle */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileOpen(true)}
                className="rounded-full border-border/60"
              >
                <MenuIcon className="size-4 mr-1" />
                Menu
              </Button>
            </div>

            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              {adminResources.filter(r => r.key !== "dashboard").map(({ key }) => (
                <Route
                  key={key}
                  path={key}
                  element={<AdminResourcePage resource={key} />}
                />
              ))}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
