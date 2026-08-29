import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  SlidersHorizontal,
  ClipboardList,
  CreditCard,
  Truck,
  Ticket,
  Users,
  UserCheck,
  Shield,
  Star,
  ScrollText,
  Store,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ChefHat,
  Warehouse,
  Carrot,
  Scale,
  UtensilsCrossed,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AdminChangePasswordDialog from "./change-password-dialog.jsx";

const iconMap = {
  dashboard: LayoutDashboard,
  kitchen: ChefHat,
  kitchen_staff: ChefHat,
  products: Package,
  categories: FolderTree,
  product_variants: Boxes,
  product_options: SlidersHorizontal,
  orders: ClipboardList,
  payments: CreditCard,
  drivers: Truck,
  coupons: Ticket,
  customers: Users,
  users: UserCheck,
  roles: Shield,
  reviews: Star,
  audit_logs: ScrollText,
  inventory: Warehouse,
  ingredients: Carrot,
  ingredient_stock: Scale,
  product_recipes: UtensilsCrossed,
};

const navGroups = [
  {
    title: "Overview",
    items: [{ key: "dashboard", label: "Dashboard" }]
  },
  {
    title: "Catalog",
    items: [
      { key: "products", label: "Products" },
      { key: "categories", label: "Categories" },
      { key: "product_variants", label: "Variants" },
      { key: "product_options", label: "Options" },
    ]
  },
  {
    title: "Operations",
    items: [
      { key: "orders", label: "Orders" },
      { key: "kitchen", label: "Kitchen (KDS)" },
      { key: "payments", label: "Payments" },
      { key: "drivers", label: "Drivers" },
      { key: "coupons", label: "Coupons" },
    ]
  },
  {
    title: "Inventory",
    items: [
      { key: "inventory", label: "Inventory" },
      { key: "ingredients", label: "Ingredients" },
      { key: "ingredient_stock", label: "Ingredient Stock" },
      { key: "product_recipes", label: "Product Recipes" },
    ]
  },
  {
    title: "System",
    items: [
      { key: "customers", label: "Customers" },
      { key: "kitchen_staff", label: "Kitchen Staff" },
      { key: "users", label: "System Users" },
      { key: "roles", label: "Roles & Access" },
      { key: "reviews", label: "Reviews" },
      { key: "audit_logs", label: "Audit Logs" },
    ]
  }
];

function AdminSidebar({ onNavigate }) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.replace("/admin/", "").replace("/admin", "") || "dashboard";

  const adminAuth = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminAuth") || "null");
    } catch {
      return null;
    }
  })();

  const handleNav = () => onNavigate?.();

  const handleSignOut = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("customerAuth");
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="w-64 bg-card/60 backdrop-blur-3xl border-r border-border/40 flex-shrink-0 flex flex-col h-full select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative z-40">
        
        {/* Brand Header */}
        <div className="p-3 border-b border-border/40">
          <Link to="/admin" onClick={handleNav} className="flex items-center gap-3 mb-3 group cursor-pointer">
            <div className="size-8 rounded-xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-primary/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              FC
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">Flame & Crust</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold tracking-widest uppercase mt-0.5">
                <ShieldCheck className="size-3 text-primary" /> Admin Base
              </p>
            </div>
          </Link>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full justify-between h-9 px-3 rounded-xl border-border/50 bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group shadow-none"
          >
            <Link to="/" onClick={handleNav}>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Store className="size-3.5 group-hover:animate-pulse" />
                Live Storefront
              </div>
              <ChevronRight className="size-3.5 opacity-50 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-secondary">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5 relative">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                {group.title}
              </h3>
              <div className="space-y-0.5 relative z-10">
                {group.items.map(({ key, label }) => {
                  const IconComponent = iconMap[key] || LayoutDashboard;
                  const isActive = currentPath === key || currentPath.startsWith(key + "/");

                  return (
                    <Link
                      key={key}
                      to={`/admin/${key}`}
                      onClick={handleNav}
                      className={cn(
                        "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "text-primary shadow-sm shadow-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20" />
                      )}
                      <div className="flex items-center gap-3 min-w-0 relative z-10">
                        <IconComponent
                          className={cn(
                            "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                            isActive ? "text-primary" : "opacity-70 group-hover:opacity-100 group-hover:text-primary"
                          )}
                        />
                        <span className="truncate">{label}</span>
                      </div>
                      {isActive && (
                        <div className="size-1.5 rounded-full bg-primary relative z-10 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Profile */}
        <div className="p-3 border-t border-border/40 bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-secondary/40 border border-border/50 hover:border-primary/30 hover:bg-secondary/60 transition-all duration-300">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="flex items-center gap-2 min-w-0 text-left group cursor-pointer flex-1"
            >
              <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
                {adminAuth?.name ? adminAuth.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {adminAuth?.name || "Administrator"}
                </p>
                <p className="text-[9px] font-black tracking-wider text-muted-foreground uppercase flex items-center gap-1 mt-0.5">
                  <KeyRound className="size-2.5 text-primary" /> {adminAuth?.role || "ADMIN"}
                </p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-colors shrink-0"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <AdminChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
}

export default AdminSidebar;
