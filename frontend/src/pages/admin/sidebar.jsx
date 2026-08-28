import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

// Map keys to modern icons
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

// Categorized navigation groups
const navGroups = [
  {
    title: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard" }
    ]
  },
  {
    title: "Catalog & Menu",
    items: [
      { key: "products", label: "Products" },
      { key: "categories", label: "Categories" },
      { key: "product_variants", label: "Variants" },
      { key: "product_options", label: "Options" },
    ]
  },
  {
    title: "Sales & Operations",
    items: [
      { key: "orders", label: "Orders" },
      { key: "kitchen", label: "Kitchen (KDS)" },
      { key: "payments", label: "Payments" },
      { key: "drivers", label: "Drivers" },
      { key: "coupons", label: "Coupons" },
    ]
  },
  {
    title: "Inventory & Recipes",
    items: [
      { key: "inventory", label: "Inventory" },
      { key: "ingredients", label: "Ingredients" },
      { key: "ingredient_stock", label: "Ingredient Stock" },
      { key: "product_recipes", label: "Product Recipes" },
    ]
  },
  {
    title: "Administration",
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
    } catch (e) {
      return null;
    }
  })();

  const handleNav = () => {
    onNavigate?.();
  };

  const handleSignOut = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("customerAuth");
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="w-64 border-r border-border/70 bg-card/95 backdrop-blur-xl flex-shrink-0 flex flex-col h-full select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Brand Header */}
        <div className="p-4 border-b border-border/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
              🔥
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-base font-bold text-foreground truncate">Flame & Crust</h2>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <ShieldCheck className="size-3 text-primary" /> Admin Control
              </p>
            </div>
          </div>

          {/* View Customer Storefront Button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/5 text-foreground hover:text-primary text-xs w-full justify-between font-semibold h-9 px-3 transition-all group"
          >
            <Link to="/" onClick={handleNav}>
              <div className="flex items-center gap-2">
                <Store className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span>Customer Storefront</span>
              </div>
              <ChevronRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Navigation Links Grouped */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map(({ key, label }) => {
                  const IconComponent = iconMap[key] || LayoutDashboard;
                  const isActive = currentPath === key || currentPath.startsWith(key + "/");

                  return (
                    <Link
                      key={key}
                      to={`/admin/${key}`}
                      onClick={handleNav}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                          : "text-foreground/75 hover:text-foreground hover:bg-secondary/70"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComponent
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                          )}
                        />
                        <span className="truncate">{label}</span>
                      </div>
                      {isActive && (
                        <div className="size-1.5 rounded-full bg-primary-foreground animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Profile & Change Password & Sign Out footer */}
        <div className="p-3 border-t border-border/70 bg-secondary/30">
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 shadow-xs">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity group cursor-pointer"
              title="Click to Change Admin Password"
            >
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0 overflow-hidden group-hover:ring-2 group-hover:ring-primary/40 transition-all">
                {adminAuth?.name ? adminAuth.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {adminAuth?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <KeyRound className="size-2.5 text-primary" /> {adminAuth?.role || "ADMIN"}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChangePasswordOpen(true)}
                title="Change Password (ប្តូរលេខសម្ងាត់)"
                className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <KeyRound className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
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
