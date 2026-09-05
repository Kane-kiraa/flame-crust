import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Menu as MenuIcon, X, Sun, Moon, Store, ShieldCheck, ChevronRight, KeyRound, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved !== null ? saved === "true" : false; // Default expanded for modern visibility!
  });
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed);
  }, [isCollapsed]);

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

  const handleSignOut = () => {
    localStorage.removeItem("adminAuth");
    navigate("/login", { replace: true });
  };

  if (!isAuthorized) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const getPageTitle = () => {
    if (currentPath === "dashboard") return "Dashboard Overview";
    return currentPath.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="h-screen overflow-hidden flex bg-zinc-950 text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <AdminSidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-68 lg:hidden shadow-2xl">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} isCollapsed={false} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/70 dark:bg-zinc-950/85 relative overflow-hidden transition-colors">
        {/* Subtle Ambient Light Orbs for Depth */}
        <div className="absolute -top-24 right-1/4 size-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/3 -left-20 size-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Admin Top Header */}
        <header className="h-[calc(env(safe-area-inset-top)+4.25rem)] pt-[env(safe-area-inset-top)] border-b border-border/50 bg-card/70 dark:bg-zinc-900/60 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1">
              <span className="hidden sm:inline bg-secondary/80 text-foreground/80 px-2.5 py-1 rounded-lg text-[11px] font-black tracking-widest">ADMIN BASE</span>
              <ChevronRight className="size-3.5 hidden sm:inline opacity-40" />
              <span className="text-foreground font-extrabold tracking-tight text-sm sm:text-base capitalize">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Store & Gateway Status Pills */}
            <div className="hidden md:flex items-center gap-2 mr-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Store Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <span className="size-1.5 rounded-full bg-primary" />
                Bakong KHQR Live
              </span>
            </div>

            {/* Visit Storefront Shortcut */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex h-9 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all font-semibold text-xs"
            >
              <Link to="/">
                <Store className="size-3.5 mr-1.5 text-primary" />
                Storefront ↗
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-xl border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
            </Button>

            {/* Sign Out Button */}
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-xl border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign Out"
            >
              <LogOut className="size-4" />
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
