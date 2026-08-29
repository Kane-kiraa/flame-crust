import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboard } from "@/lib/api";
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
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Flame,
  Calendar,
  Layers,
  ChefHat,
  PieChart,
  MessageSquare,
  AlertTriangle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatTime, formatDate } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell } from "recharts";

// SWR-style in-memory cache for instant dashboard rendering
let memoryDashboardCache = null;
try {
  const stored = localStorage.getItem("flame_admin_dashboard_cache");
  if (stored) {
    memoryDashboardCache = JSON.parse(stored);
  }
} catch (e) {}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-secondary/80 rounded-full" />
          <div className="h-8 w-64 sm:w-80 bg-secondary rounded-2xl" />
          <div className="h-4 w-48 sm:w-64 bg-secondary/60 rounded-md" />
        </div>
        <div className="h-11 w-36 bg-secondary rounded-2xl" />
      </div>

      {/* 4 KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-border/50 bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-secondary/80 rounded-md" />
              <div className="size-10 rounded-2xl bg-secondary/60" />
            </div>
            <div className="h-8 sm:h-9 w-28 bg-secondary rounded-xl" />
            <div className="h-4 w-20 bg-secondary/60 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-secondary rounded-md" />
          <div className="h-8 w-28 bg-secondary rounded-xl" />
        </div>
        <div className="h-[280px] w-full bg-secondary/30 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(() => memoryDashboardCache);
  const [recentOrders, setRecentOrders] = useState(() => memoryDashboardCache?.recentOrders || []);
  const [chartData, setChartData] = useState(() => memoryDashboardCache?.chartDataProcessed || []);
  const [loading, setLoading] = useState(!memoryDashboardCache);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7d"); // "7d" | "30d"

  const adminAuth = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminAuth") || "null");
    } catch {
      return null;
    }
  })();

  const processChartData = (dashData) => {
    if (dashData?.chartData && Array.isArray(dashData.chartData) && dashData.chartData.length > 0) {
      return dashData.chartData.map((pt) => {
        const d = new Date(pt.order_date);
        return {
          date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: Number(pt.daily_revenue || 0),
          orders: Number(pt.order_count || 1),
        };
      });
    }

    // Default 7-day points
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: 0,
        orders: 0,
      };
    });

    const ordersList = dashData?.recentOrders || dashData?.orders || [];
    ordersList.forEach((order) => {
      if (order.status !== "CANCELLED" && order.created_at && order.total) {
        const orderDate = new Date(order.created_at);
        const dayStr = orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const point = last7Days.find((p) => p.date === dayStr);
        if (point) {
          point.revenue += Number(order.total);
          point.orders += 1;
        }
      }
    });

    return last7Days;
  };

  useEffect(() => {
    let isMounted = true;

    getDashboard()
      .then((dashData) => {
        if (!isMounted || !dashData) return;
        
        const processedChart = processChartData(dashData);
        const orders = dashData.recentOrders || dashData.orders || [];

        setData(dashData);
        setRecentOrders(orders);
        setChartData(processedChart);
        setError(null);

        // Cache response for instant loads on next visit
        const cachePayload = {
          ...dashData,
          recentOrders: orders,
          chartDataProcessed: processedChart,
        };
        memoryDashboardCache = cachePayload;
        try {
          localStorage.setItem("flame_admin_dashboard_cache", JSON.stringify(cachePayload));
        } catch (e) {}
      })
      .catch((err) => {
        if (isMounted && !data) {
          setError(err.message || "Failed to load dashboard data");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Summary Metrics calculations
  const totalRevenue = Number(data?.totalRevenue || 0);
  const totalOrdersCount = Number(data?.totalOrders || recentOrders.length || 0);
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : "0.00";
  const topProducts = data?.topProducts || [];
  
  // Assign colors to categories dynamically from backend
  const categoryColors = ["hsl(var(--primary))", "hsl(var(--amber-500))", "hsl(var(--emerald-500))", "hsl(var(--blue-500))", "hsl(var(--rose-500))"];
  const categoryData = (data?.categoryData || []).map((cat, idx) => ({
    name: cat.name,
    value: Number(cat.value || 0),
    color: categoryColors[idx % categoryColors.length]
  }));

  const recentReviews = (data?.recentReviews || []).map(rev => ({
    customer: rev.customer || "Anonymous",
    rating: Number(rev.rating || 5),
    comment: rev.comment || "",
    time: formatTime(rev.time) || "Recently"
  }));

  const lowStock = (data?.lowStock || []).map(stock => ({
    item: stock.item,
    current: `${stock.current}`,
    min: `${stock.min}`,
    critical: stock.critical === 1 || stock.critical === true
  }));

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: "+14.2%",
      trendUp: true,
      subText: "vs last month",
      color: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      badgeColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
    },
    {
      label: "Total Orders",
      value: totalOrdersCount.toLocaleString(),
      icon: ShoppingBag,
      trend: "+8.4%",
      trendUp: true,
      subText: "vs last month",
      color: "from-blue-500/20 via-blue-500/5 to-transparent",
      badgeColor: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
    },
    {
      label: "Active Drivers",
      value: String(data?.activeDrivers || 1),
      icon: Truck,
      trend: "Online",
      trendUp: true,
      subText: "Ready for delivery",
      color: "from-amber-500/20 via-amber-500/5 to-transparent",
      badgeColor: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
    },
    {
      label: "Live Products",
      value: String(data?.totalProducts || 55),
      icon: Package,
      trend: "Active",
      trendUp: true,
      subText: "In menu catalog",
      color: "from-primary/20 via-primary/5 to-transparent",
      badgeColor: "text-primary bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      iconBg: "bg-primary/10 dark:bg-primary/20 border-primary/20",
    },
  ];

  const quickLinks = [
    {
      label: "Add New Product",
      href: "/admin/products",
      icon: Plus,
      desc: "Create pizza, burger, sides",
      badge: "Menu",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      label: "Kitchen Display (KDS)",
      href: "/admin/kitchen",
      icon: ChefHat,
      desc: "Live order preparation queue",
      badge: "Live",
      gradient: "from-red-500 to-rose-500",
    },
    {
      label: "Manage Orders",
      href: "/admin/orders",
      icon: ClipboardList,
      desc: "Order statuses & delivery tracking",
      badge: "Sales",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Coupons & Discounts",
      href: "/admin/coupons",
      icon: Ticket,
      desc: "Promo codes & deals",
      badge: "Marketing",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  if (loading && !data) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full pb-12">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-3xl p-5 sm:p-6 shadow-sm">
        {/* Glow ambient background elements */}
        <div className="absolute -right-16 -top-16 size-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-16 size-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Calendar className="size-3" />
                {todayStr}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Store Live
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Welcome back, <span className="text-primary">{adminAuth?.name || "Admin"}</span> 👋
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xl leading-relaxed">
              Here is what's happening with your Flame & Crust orders, revenue, and kitchen activity today.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              asChild
              className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 text-xs sm:text-sm flex items-center gap-2 group"
            >
              <Link to="/">
                <Store className="size-4 group-hover:scale-110 transition-transform" />
                <span>Visit Storefront</span>
                <ArrowUpRight className="size-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-[20px] border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Soft background gradient tint */}
            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none", stat.color)} />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                {stat.label}
              </span>
              <div className={cn("size-8 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110", stat.iconBg)}>
                <stat.icon className={cn("size-4", stat.iconColor)} />
              </div>
            </div>

            <div className="relative z-10 mt-3">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {stat.value}
              </h2>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", stat.badgeColor)}>
                  <TrendingUp className="size-3" />
                  {stat.trend}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {stat.subText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue & Sales Chart */}
        <div className="lg:col-span-2 rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border/30 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
                  Revenue Trends
                </h3>
              </div>
            </div>

            {/* Quick Analytics Summary Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="px-2.5 py-1 rounded-xl bg-secondary/40 border border-border/40 text-[10px] font-bold flex items-center gap-1.5">
                <span className="text-muted-foreground">Avg:</span>
                <span className="text-foreground">${avgOrderValue}</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary flex items-center gap-1.5">
                <span>Orders:</span>
                <span>{totalOrdersCount}</span>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-[180px] sm:h-[220px] w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rev = Number(payload[0].value || 0);
                    return (
                      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-3 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-foreground">{label}</p>
                        <div className="flex items-center gap-2 text-primary font-black text-sm">
                          <DollarSign className="size-3.5" />
                          <span>${rev.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="natural"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-1 rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-border/30 pb-3">
            <Flame className="size-4 text-amber-500" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
              Top Selling Items
            </h3>
          </div>
          <div className="space-y-3 flex-1">
            {topProducts.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">No sales data yet</div>
            ) : topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-lg bg-amber-500/10 text-amber-600 font-black text-[10px] flex items-center justify-center border border-amber-500/20">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground line-clamp-1">{prod.name}</p>
                    <p className="text-[9px] font-bold text-muted-foreground">{prod.sales} sales</p>
                  </div>
                </div>
                <div className="text-[11px] font-black text-foreground">
                  ${Number(prod.revenue || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Quick Actions & Live Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Quick Shortcuts */}
        <div className="xl:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-3.5 text-primary" />
              Quick Shortcuts
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-1 gap-2.5">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="group relative overflow-hidden p-3 rounded-[20px] border border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/40 hover:shadow-sm transition-all duration-300 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("size-8 rounded-xl bg-gradient-to-tr text-white flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110", item.gradient)}>
                    <item.icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.label}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Recent Orders Overview */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="size-3.5 text-primary" />
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
            {recentOrders.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="size-14 rounded-3xl bg-secondary flex items-center justify-center mb-3 text-muted-foreground">
                  <ClipboardList className="size-6" />
                </div>
                <p className="text-sm font-bold text-foreground">No orders recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  New orders will automatically stream into this dashboard in real-time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentOrders.slice(0, 5).map((order) => {
                  const status = (order.status || "PENDING").toUpperCase();
                  const isDelivered = status === "DELIVERED" || status === "COMPLETED";
                  const isPreparing = status === "PREPARING" || status === "COOKING" || status === "READY";
                  const isDelivery = status === "OUT_FOR_DELIVERY" || status === "ON_THE_WAY";

                  return (
                    <div
                      key={order.id}
                      className="p-3 sm:p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors group gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                          {(order.customer_name || "G")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-[11px] font-bold text-foreground truncate max-w-[150px]">
                              {order.customer_name || order.customer_phone || `Customer #${order.customer_id || "Guest"}`}
                            </p>
                            <span className="font-mono text-[9px] font-bold text-muted-foreground bg-secondary/80 px-1 py-0.5 rounded border border-border/50">
                              #{order.order_number ? (order.order_number.length > 8 ? order.order_number.slice(-6) : order.order_number) : order.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                            <Clock className="size-3 text-muted-foreground/70" />
                            {formatTime(order.created_at || order.createdAt) || "Just now"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-serif text-xs font-black text-foreground">
                          ${Number(order.total_price || order.total || 0).toFixed(2)}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border",
                            isDelivered
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : isDelivery
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : isPreparing
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          )}
                        >
                          {order.status || "PENDING"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Row: Extra Analytics & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales by Category (Pie) */}
        <div className="rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-border/30 pb-3">
            <PieChart className="size-4 text-primary" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
              Sales by Category
            </h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[160px]">
            <ResponsiveContainer width="100%" height={160}>
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPie>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total</span>
              <span className="text-lg font-black text-foreground">100%</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name} ({cat.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-border/30 pb-3">
            <MessageSquare className="size-4 text-blue-500" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
              Recent Feedback
            </h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {recentReviews.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">No feedback yet</div>
            ) : recentReviews.map((rev, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-secondary/30 border border-border/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-foreground">{rev.customer}</span>
                  <span className="text-[9px] font-bold text-muted-foreground">{rev.time}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-2.5", i < rev.rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted")} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-[24px] border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-border/30 pb-3">
            <AlertTriangle className="size-4 text-rose-500" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
              Low Stock Alerts
            </h3>
          </div>
          <div className="space-y-2.5 flex-1">
            {lowStock.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">Stock levels are healthy</div>
            ) : lowStock.map((stock, idx) => (
              <div key={idx} className={cn("p-3 rounded-2xl border flex items-center justify-between gap-3", stock.critical ? "bg-rose-500/5 border-rose-500/20" : "bg-amber-500/5 border-amber-500/20")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0 border", stock.critical ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20")}>
                    <Layers className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{stock.item}</p>
                    <p className="text-[9px] font-bold text-muted-foreground mt-0.5">Min: {stock.min}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn("text-[11px] font-black block", stock.critical ? "text-rose-500" : "text-amber-500")}>
                    {stock.current}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

