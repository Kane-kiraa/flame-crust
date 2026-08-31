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
          "h-full bg-card/60 backdrop-blur-3xl border-r border-border/40 flex flex-col transition-all duration-300 relative",
          isCollapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        
        {/* Brand Header */}
        <div className="h-[calc(68px+env(safe-area-inset-top))] pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 px-3 border-b border-border/40 flex items-center relative group shrink-0">
          <Link to="/admin" onClick={handleNav} className="flex items-center gap-3 w-full">
            <div className={cn(
              "size-8 shrink-0 rounded-xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-primary/30 transition-all duration-300",
              isCollapsed && "group-hover:opacity-0"
            )}>
              FC
            </div>
            <div className={cn("min-w-0 overflow-hidden transition-all duration-300 flex flex-col justify-center", isCollapsed ? "w-0 opacity-0 ml-0" : "w-[120px] opacity-100")}>
              <h2 className="font-serif text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors whitespace-nowrap">Flame & Crust</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold tracking-widest uppercase mt-0.5 whitespace-nowrap">
                <ShieldCheck className="size-3 text-primary shrink-0" /> Admin Base
              </p>
            </div>
          </Link>

          {/* Expand Toggle (Appears on Hover when Collapsed) */}
          {isCollapsed && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCollapse}
              className="absolute left-3 size-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 bg-secondary/80 border-border shadow-sm backdrop-blur-sm"
              title="Expand Sidebar"
            >
              <PanelLeft className="size-4" />
            </Button>
          )}

          {/* Collapse Toggle (Visible on Right when Expanded) */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="absolute right-3 size-8 rounded-xl text-muted-foreground hover:text-foreground hidden lg:flex bg-background/50 hover:bg-secondary"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-secondary">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5 relative">
              <div className="relative h-5 flex items-center mb-0.5">
                <div className={cn("absolute inset-y-0 left-0 overflow-hidden transition-all duration-300 flex items-center", isCollapsed ? "w-0 opacity-0" : "w-full opacity-100")}>
                  <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 whitespace-nowrap">
                    {group.title}
                  </h3>
                </div>
                <div className={cn("absolute inset-0 flex items-center px-4 transition-all duration-300", isCollapsed ? "opacity-100 delay-100" : "opacity-0 pointer-events-none")}>
                  <div className="w-full h-px bg-border/80 rounded-full" />
                </div>
              </div>
              <div className="space-y-0.5 relative z-10">
                {group.items.map(({ key, label }) => {
                  const IconComponent = iconMap[key] || LayoutDashboard;
                  const isActive = currentPath === key || currentPath.startsWith(key + "/");

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/admin/${key}`}
                          onClick={handleNav}
                          className={cn(
                            "flex items-center rounded-xl text-xs font-bold transition-all duration-300 group relative overflow-hidden w-full py-1.5 px-3",
                            isActive
                              ? "text-primary shadow-sm shadow-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                          )}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20" />
                          )}
                          <IconComponent
                            className={cn(
                              "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110 relative z-10",
                              isActive ? "text-primary" : "opacity-70 group-hover:opacity-100 group-hover:text-primary"
                            )}
                          />
                          <div className={cn("overflow-hidden transition-all duration-300 relative z-10", isCollapsed ? "w-0 opacity-0 ml-0" : "w-[150px] opacity-100 ml-3")}>
                            <span className="truncate whitespace-nowrap block">{label}</span>
                          </div>
                          {!isCollapsed && isActive && (
                            <div className="size-1.5 rounded-full bg-primary relative z-10 shadow-[0_0_8px_rgba(var(--primary),0.8)] ml-auto" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="font-bold">
                          {label}
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
        <div className="px-3 pb-2 pt-1 mt-auto shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                asChild
                className={cn(
                  "w-full bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl",
                  isCollapsed ? "px-0 justify-center h-10" : "justify-start px-3 h-10"
                )}
              >
                <Link to="/" replace>
                  <Store className={cn("shrink-0", isCollapsed ? "size-4" : "size-4 mr-2")} />
                  {!isCollapsed && <span className="font-bold text-xs uppercase tracking-wider">Storefront</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right" className="font-bold">Visit Storefront</TooltipContent>}
          </Tooltip>
        </div>

        {/* Admin Account Footer */}
        <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border/40 bg-transparent shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center group cursor-pointer transition-all duration-300 w-full rounded-xl hover:bg-secondary/50 p-1 relative overflow-hidden outline-none"
                  >
                    <div className="size-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-[inset_0_0_0_1px_rgba(var(--primary),0.2)] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {adminAuth?.name ? adminAuth.name.slice(0, 2).toUpperCase() : "AD"}
                    </div>
                    <div className={cn("overflow-hidden transition-all duration-300 flex flex-col items-start", isCollapsed ? "w-0 opacity-0 ml-0" : "w-[120px] opacity-100 ml-3")}>
                      <p className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors whitespace-nowrap">
                        {adminAuth?.name || "Administrator"}
                      </p>
                      <p className="text-[9px] font-black tracking-wider text-muted-foreground uppercase flex items-center gap-1 mt-0.5 whitespace-nowrap">
                        <KeyRound className="size-2.5 text-primary shrink-0" /> {adminAuth?.role || "ADMIN"}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right" className="font-bold">Admin Profile</TooltipContent>}
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
