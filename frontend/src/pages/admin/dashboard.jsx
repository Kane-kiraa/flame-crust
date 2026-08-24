import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboard, list } from "@/lib/api";
import {
  DollarSign,
  ShoppingBag,
  Bike,
  Package,
  TrendingUp,
  Store,
  Plus,
  ArrowRight,
  ClipboardList,
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminAuth = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminAuth") || "null");
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    Promise.all([
      getDashboard().catch(() => null),
      list("orders").catch(() => [])
    ])
      .then(([dashData, ordersData]) => {
        setData(dashData);
        if (Array.isArray(ordersData)) {
          setRecentOrders(ordersData.slice(0, 5));
          
          // Process chart data: group revenue by date (last 7 days)
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
              date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              revenue: 0,
              fullDate: d
            };
          });

          ordersData.forEach(order => {
            if (order.status !== "CANCELLED" && order.created_at && order.total) {
              const orderDate = new Date(order.created_at);
              const dayStr = orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const point = last7Days.find(p => p.date === dayStr);
              if (point) {
                point.revenue += Number(order.total);
              }
            }
          });

          setChartData(last7Days);
        }
      })
      .catch((err) => setError(err.message || "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 max-w-md mx-auto my-8">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Total Revenue",
      value: `$${Number(data?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      trend: "+12.5%",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Total Orders",
      value: String(data?.totalOrders || recentOrders.length || 0),
      icon: ShoppingBag,
      trend: "+8.4%",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Active Drivers",
      value: String(data?.activeDrivers || 0),
      icon: Bike,
      trend: "+4.1%",
      color: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "Live Products",
      value: String(data?.totalProducts || 0),
      icon: Package,
      trend: "Active",
      color: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  const quickLinks = [
    { label: "Add New Product", href: "/admin/products", icon: Plus, desc: "Create pizza or burger" },
    { label: "View All Orders", href: "/admin/orders", icon: ClipboardList, desc: "Manage live orders" },
    { label: "Manage Coupons", href: "/admin/coupons", icon: Ticket, desc: "Discounts & promos" },
    { label: "Customer List", href: "/admin/customers", icon: Users, desc: "View registered users" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card via-card to-secondary/40 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        {/* Layer aesthetics */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
              {todayStr}
            </span>
          </div>
          <h1 className="font-serif text-lg sm:text-2xl font-bold text-foreground mt-1 tracking-tight">
            Welcome back, {adminAuth?.name || "Admin"} 👋
          </h1>
          <p className="text-muted-foreground text-[11px] sm:text-xs mt-1 max-w-sm leading-relaxed font-medium">
            Here is what's happening in your Flame & Crust store today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10 mt-2 sm:mt-0">
          <Button asChild className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground font-bold shadow-sm h-10 px-5 text-[11px] sm:text-xs transition-transform active:scale-[0.98]">
            <Link to="/">
              <Store className="size-3.5 mr-2" />
              View Frontend
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between relative overflow-hidden group hover:border-border"
          >
            {/* Subtle background layer */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.color} rounded-bl-[100px] opacity-40 pointer-events-none group-hover:scale-110 group-hover:opacity-60 transition-all duration-500`} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${stat.iconBg} hidden sm:flex items-center justify-center`}>
                <stat.icon className={`size-3.5 sm:size-4 ${stat.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 relative z-10">
              <h3 className="font-serif text-xl sm:text-3xl font-bold text-foreground tracking-tight">
                {stat.value}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[9px] sm:text-[10px] font-bold">
                <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="size-2.5 mr-1" />
                  <span>{stat.trend}</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline ml-0.5 font-medium">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Overview Chart */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm">
        <h2 className="font-serif text-sm sm:text-base font-bold text-foreground flex items-center gap-2 mb-4">
          <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block" /> Sales Overview (Last 7 Days)
        </h2>
        <div className="h-[250px] sm:h-[300px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary, #f97316)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary, #f97316)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: "12px", marginBottom: "4px" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary, #f97316)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions Section */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-serif text-sm sm:text-base font-bold text-foreground flex items-center gap-2 px-1">
            <span className="w-1.5 h-3.5 bg-primary rounded-full inline-block" /> Quick Shortcuts
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="p-3 sm:p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-secondary/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-3 group shadow-xs relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full">
                  <div className="flex items-center justify-between w-full lg:w-auto">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <item.icon className="size-3.5" />
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all lg:hidden" />
                  </div>
                  <div>
                    <h4 className="text-[11px] sm:text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {item.label}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 line-clamp-1 font-medium">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all hidden lg:block shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-500 rounded-full inline-block" /> Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-[10px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full"
            >
              View all
            </Link>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
            {recentOrders.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="size-12 rounded-full bg-secondary flex items-center justify-center mb-3 border border-border/50">
                  <ClipboardList className="size-5 text-muted-foreground/50" />
                </div>
                <p className="text-xs font-bold text-foreground">No orders recorded yet</p>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">Place an order on the storefront to see it here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 sm:p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 sm:size-9 rounded-xl bg-secondary flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-bold text-foreground/80 border border-border/40 group-hover:border-primary/20 transition-colors">
                        #{order.id}
                      </div>
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-foreground">
                          {order.customer_name || order.customer_phone || `Customer #${order.customer_id || "Guest"}`}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="size-2.5" />
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"} 
                          <span className="text-border mx-0.5">•</span> 
                          {order.items_count || 1} items
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-foreground font-sans">
                        ${Number(order.total_price || order.total || 0).toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/10">
                        {order.status || "PENDING"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
