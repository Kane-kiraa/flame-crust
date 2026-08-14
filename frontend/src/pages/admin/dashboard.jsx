import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import { DollarSign, ShoppingBag, Bike, Store, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  const stats = [
    { label: "Total Revenue", value: `$${data?.totalRevenue || '0.00'}`, icon: DollarSign, trend: "+12.5%" },
    { label: "Total Orders", value: data?.totalOrders || '0', icon: ShoppingBag, trend: "+8.1%" },
    { label: "Active Drivers", value: data?.activeDrivers || '0', icon: Bike, trend: "+5.3%" },
    { label: "Total Products", value: data?.totalProducts || '0', icon: Store, trend: "+2.0%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <stat.icon className="size-4 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">{stat.value}</h2>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="size-3" /> {stat.trend} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6 min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center">Chart data visualization will go here.</p>
      </div>
    </div>
  );
}
