import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Users,
  ShoppingBag,
  Activity,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { list } from "@/lib/api";

export function DatabaseDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [orders, customers, products] = await Promise.all([
        list("orders").catch(() => []),
        list("customers").catch(() => []),
        list("products").catch(() => [])
      ]);
      
      const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? o.total : 0), 0);
      const activeOrders = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status)).length;
      
      const chartData = Array.from({length: 7}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString());
        return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayOrders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? o.total : 0), 0)
        };
      });

      const maxRev = Math.max(...chartData.map(d => d.revenue), 100);

      setMetrics({
        totalRevenue,
        activeOrders,
        totalCustomers: customers.length,
        totalProducts: products.length,
        chartData,
        maxRev
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <section id="dashboard" className="border-t border-border/60 bg-secondary/25 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"><Database className="size-3.5" /> Dashboard</span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-foreground">Operational Metrics</h2>
          </div>
          <Button variant="outline" className="rounded-full" onClick={fetchMetrics}><RefreshCw className="mr-2 size-4" /> Refresh</Button>
        </div>

        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <RefreshCw className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : metrics && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card shadow-sm border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="size-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${metrics.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="bg-card shadow-sm border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
                  <Activity className="size-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metrics.activeOrders}</div>
                </CardContent>
              </Card>
              <Card className="bg-card shadow-sm border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
                  <Users className="size-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metrics.totalCustomers}</div>
                </CardContent>
              </Card>
              <Card className="bg-card shadow-sm border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
                  <ShoppingBag className="size-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metrics.totalProducts}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Revenue Trend (7 Days)</h3>
              <div className="h-48 flex items-end gap-4">
                {metrics.chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.revenue / metrics.maxRev) * 100}%` }}
                      className="w-full bg-primary rounded-t-sm"
                    />
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
