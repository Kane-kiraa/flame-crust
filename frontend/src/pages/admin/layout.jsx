import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Menu as MenuIcon, X, Sun, Moon, Store, ShieldCheck, ChevronRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider.jsx";
import AdminSidebar from "./sidebar.jsx";
import AdminResourcePage from "./resource-page.jsx";
import AdminDashboard from "./dashboard.jsx";
import KitchenDashboard from "./kitchen-dashboard.jsx";
import AdminChangePasswordDialog from "./change-password-dialog.jsx";

const adminResources = [
  "products",
  "product_options",
  "product_variants",
  "categories",
  "customers",
  "orders",
  "payments",
  "drivers",
  "coupons",
  "users",
  "roles",
  "reviews",
  "audit_logs",
  "kitchen_staff",
  "inventory",
  "ingredients",
  "ingredient_stock",
  "product_recipes",
];

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const auth = localStorage.getItem("adminAuth");
      return auth ? JSON.parse(auth) : null;
    } catch {
      return null;
    }
  });

  const isAuthorized = adminAuth && (adminAuth.role || "").toUpperCase() === "ADMIN";

  const currentPath = location.pathname.replace("/admin/", "").replace("/admin", "") || "dashboard";

  if (!isAuthorized) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const getPageTitle = () => {
    if (currentPath === "dashboard") return "Dashboard Overview";
    return currentPath.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-64 lg:hidden shadow-2xl">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-secondary/15">
        {/* Admin Top Header */}
        <header className="h-[calc(env(safe-area-inset-top)+4.5rem)] pt-[env(safe-area-inset-top)] border-b border-border/30 bg-card/40 backdrop-blur-3xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden size-9 rounded-xl border-border/80"
              aria-label="Open menu"
            >
              <MenuIcon className="size-4" />
            </Button>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
              <span className="hidden sm:inline bg-secondary/80 px-2 py-1 rounded-md">Admin Space</span>
              <ChevronRight className="size-3 hidden sm:inline opacity-50" />
              <span className="text-foreground font-black tracking-tight text-sm sm:text-base capitalize">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Change Password Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordOpen(true)}
              className="rounded-xl border-border/50 text-xs font-bold h-9 px-3.5 bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 flex items-center gap-2 group"
              title="Change Admin Password"
            >
              <KeyRound className="size-3.5 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="hidden md:inline">Password</span>
            </Button>

            {/* Direct Storefront Link */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex rounded-xl border-border/50 text-xs font-bold h-9 px-3.5 bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group"
            >
              <Link to="/">
                <Store className="size-3.5 mr-2 text-primary group-hover:text-primary-foreground transition-colors" />
                Storefront
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        {/* Change Password Dialog */}
        <AdminChangePasswordDialog
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
        />

        {/* Dynamic Page Routes */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          <div className="w-full">
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="kitchen" element={<KitchenDashboard />} />
              {adminResources.map((key) => (
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
