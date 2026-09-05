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
  KeyRound,
  PanelLeft,
  PanelLeftClose
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function AdminSidebar({ onNavigate, isCollapsed, toggleCollapse }) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const auth = localStorage.getItem("adminAuth");
      return auth ? JSON.parse(auth) : null;
    } catch {
      return null;
    }
  });
  const location = useLocation();
  const currentPath = location.pathname.replace("/admin/", "").replace("/admin", "") || "dashboard";

  const handleNav = () => onNavigate?.();

  const handleSignOut = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("customerAuth");
    window.location.href = "/login";
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside 
        className={cn(
          "h-full bg-card/85 dark:bg-zinc-900/90 backdrop-blur-2xl border-r border-border/50 flex flex-col transition-[width] duration-300 ease-in-out relative shadow-sm select-none z-20 overflow-hidden",
          isCollapsed ? "w-[64px]" : "w-[245px]"
        )}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-border/50 px-3 flex items-center justify-between shrink-0 overflow-hidden">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="size-10 rounded-xl bg-gradient-to-tr from-primary via-orange-500 to-amber-500 text-white hover:opacity-90 shadow-xs shadow-primary/25 flex items-center justify-center group mx-auto"
                >
                  <PanelLeft className="size-4.5 transition-transform group-hover:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="font-bold">
                Expand Sidebar
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="w-full flex items-center justify-between">
              <Link to="/admin" onClick={handleNav} className="flex items-center gap-2.5 overflow-hidden min-w-0 group">
                <div className="size-9 shrink-0 rounded-xl bg-gradient-to-tr from-primary via-orange-500 to-amber-400 text-white flex items-center justify-center font-black text-sm shadow-xs shadow-primary/25 group-hover:scale-105 transition-transform">
                  🔥
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h2 className="font-serif text-sm font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors truncate leading-tight">
                    Flame & Crust
                  </h2>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 font-black tracking-wider uppercase">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Command
                  </p>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar flex flex-col justify-start">
          {navGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1 relative">
              {isCollapsed ? (
                groupIdx > 0 && <div className="w-5 h-px bg-border/40 mx-auto my-1.5 rounded-full" />
              ) : (
                <div className="h-5 flex items-center px-1.5 mt-2 mb-0.5 first:mt-0">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground/60 whitespace-nowrap">
                    {group.title}
                  </h3>
                </div>
              )}

              <div className="space-y-1 relative z-10">
                {group.items.map(({ key, label }) => {
                  const IconComponent = iconMap[key] || LayoutDashboard;
                  const isActive = currentPath === key || currentPath.startsWith(key + "/");

                  // Specific badges for key operational links
                  const badgeText = key === "kitchen" ? "KDS" : key === "orders" ? "LIVE" : null;
                  const badgeColor = key === "kitchen" 
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/admin/${key}`}
                          onClick={handleNav}
                          className={cn(
                            "flex items-center h-10 w-full rounded-xl transition-colors duration-150 group relative overflow-hidden",
                            isActive
                              ? "bg-primary/15 text-primary font-bold border border-primary/25 shadow-xs shadow-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 font-medium"
                          )}
                        >
                          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            <IconComponent
                              className={cn(
                                "size-4.5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                                isActive ? "text-primary" : "opacity-80 group-hover:opacity-100 group-hover:text-primary"
                              )}
                            />
                          </div>

                          {!isCollapsed && (
                            <div className="flex items-center justify-between flex-1 min-w-0 pr-2.5">
                              <span className="truncate whitespace-nowrap text-[13px] font-medium ml-1">
                                {label}
                              </span>
                              {badgeText && !isActive && (
                                <span className={cn("ml-auto text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0", badgeColor)}>
                                  {badgeText}
                                </span>
                              )}
                              {isActive && (
                                <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(239,68,68,0.9)] ml-auto shrink-0 animate-pulse" />
                              )}
                            </div>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" sideOffset={12}>
                          {label} {badgeText ? `(${badgeText})` : ""}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Actions (Storefront) */}
        <div className="px-3 pt-2 mt-auto shrink-0 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                asChild
                className="w-full h-10 px-0 flex items-center justify-start bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200 rounded-xl overflow-hidden"
              >
                <Link to="/" replace>
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <Store className="size-4.5 shrink-0" />
                  </div>
                  {!isCollapsed && (
                    <span className="font-bold text-xs uppercase tracking-wider overflow-hidden whitespace-nowrap ml-1 flex-1 pr-2">
                      Storefront
                    </span>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right" sideOffset={12} className="font-bold">Visit Storefront</TooltipContent>}
          </Tooltip>
        </div>

        {/* Admin Account Footer */}
        <div className="p-3 border-t border-border/40 bg-transparent shrink-0 flex justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 flex items-center justify-start rounded-xl hover:bg-secondary/50 outline-none transition-colors duration-150 overflow-hidden cursor-pointer"
                  >
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-[inset_0_0_0_1px_rgba(var(--primary),0.2)]">
                        {adminAuth?.name ? adminAuth.name.slice(0, 2).toUpperCase() : "AD"}
                      </div>
                    </div>
                    {!isCollapsed && (
                      <div className="ml-1 flex flex-col items-start min-w-0 flex-1 overflow-hidden pr-2">
                        <p className="text-[11.5px] font-bold text-foreground truncate group-hover:text-primary transition-colors whitespace-nowrap leading-tight">
                          {adminAuth?.name || "Administrator"}
                        </p>
                        <p className="text-[9px] font-black tracking-wider text-muted-foreground uppercase flex items-center gap-1 mt-0.5 whitespace-nowrap">
                          <KeyRound className="size-2.5 text-primary shrink-0" /> {adminAuth?.role || "ADMIN"}
                        </p>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right" sideOffset={12} className="font-bold">Admin Profile</TooltipContent>}
            </Tooltip>

            <DropdownMenuContent align={isCollapsed ? "start" : "center"} side={isCollapsed ? "right" : "top"} sideOffset={12} className="w-56 rounded-xl border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-[100]">
              <DropdownMenuLabel className="font-bold flex flex-col gap-1 p-2">
                <span className="text-sm">{adminAuth?.name || "Administrator"}</span>
                <span className="text-xs text-muted-foreground font-normal">{adminAuth?.email || "admin@flamecrust.com"}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-bold focus:bg-primary/10 focus:text-primary transition-colors">
                <Link to="/" replace>
                  <Store className="size-4 mr-2" /> Live Storefront
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)} className="rounded-lg cursor-pointer font-bold focus:bg-primary/10 focus:text-primary transition-colors">
                <KeyRound className="size-4 mr-2" /> Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer font-bold text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors">
                <LogOut className="size-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <AdminChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </TooltipProvider>
  );
}

export default AdminSidebar;
