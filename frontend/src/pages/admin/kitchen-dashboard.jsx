import { useEffect, useState } from "react";
import { list, update } from "@/lib/api";
import { toast } from "sonner";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  ShoppingBag,
  RefreshCw,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

let cachedKitchenProducts = [];

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState(() => cachedKitchenProducts);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isInitial = false) => {
    try {
      const promises = [
        list("orders"),
        list("order_items")
      ];
      if (cachedKitchenProducts.length === 0 || isInitial) {
        promises.push(list("products"));
      }
      
      const results = await Promise.all(promises);
      setOrders(results[0] || []);
      setOrderItems(results[1] || []);
      if (results[2]) {
        cachedKitchenProducts = results[2];
        setProducts(results[2]);
      }
    } catch (error) {
      if (isInitial) toast.error("Failed to load kitchen data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update("orders", orderId, { status: newStatus });
      toast.success(`Order #${orderId} moved to ${newStatus.replace(/_/g, " ")}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Filter and enrich orders
  const activeOrders = orders
    .filter(o => ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(order => ({
      ...order,
      items: orderItems.filter(item => String(item.order_id) === String(order.id)).map(item => {
        const product = products.find(p => String(p.id) === String(item.product_id));
        return {
          ...item,
          product_name: product?.name || item.product_name,
        };
      })
    }));

  const pendingOrders = activeOrders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
  const preparingOrders = activeOrders.filter(o => o.status === "PREPARING");
  const readyOrders = activeOrders.filter(o => o.status === "READY");

  const OrderCard = ({ order }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col">
      <div className="flex items-start justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-4 transition-colors">
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
            Order
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-none">
            #{order.order_number || order.id}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
            Time
          </span>
          <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 px-2 py-1 rounded-lg transition-colors">
            <Clock className="size-3.5 text-slate-500 dark:text-zinc-400" />
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] mb-5 space-y-3 custom-scrollbar pr-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="bg-slate-100/80 dark:bg-zinc-800 px-2.5 py-1 rounded-xl font-black text-lg text-slate-900 dark:text-zinc-100 min-w-[40px] text-center shrink-0 border border-slate-200/60 dark:border-white/5 shadow-sm transition-colors">
              {item.quantity}x
            </div>
            <div className="flex-1 pt-1 leading-tight">
              <span className="font-bold text-base text-slate-800 dark:text-zinc-200">{item.product_name}</span>
              {item.options && item.options !== "{}" && (
                <div className="text-sm font-medium text-slate-500 dark:text-zinc-500 mt-1 flex flex-wrap gap-1">
                  {(() => {
                    try {
                      return Object.values(JSON.parse(item.options)).map((opt, i) => (
                         <span key={i} className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md transition-colors">{opt}</span>
                      ));
                    } catch (e) {
                      return <span className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md transition-colors">{String(item.options)}</span>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 transition-colors">
        {order.status === "PENDING" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
            className="w-full h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all font-bold border border-blue-200 dark:border-blue-500/20"
          >
            Confirm Order
          </Button>
        )}
        {order.status === "CONFIRMED" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "PREPARING")}
            className="w-full h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all font-bold border border-orange-200 dark:border-orange-500/20"
          >
            <Flame className="size-4 mr-2" />
            Start Preparing
          </Button>
        )}
        {order.status === "PREPARING" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "READY")}
            className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all font-bold"
          >
            <CheckCircle2 className="size-4 mr-2" />
            Mark as Ready
          </Button>
        )}
        {order.status === "READY" && (
          <div className="w-full h-12 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 transition-colors">
            <ShoppingBag className="size-4" />
            Waiting for Driver
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2 text-foreground">
            <ChefHat className="size-6 text-primary" /> Kitchen Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage live orders and update preparation status in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.open("/kitchen/login", "_blank")}
            className="rounded-xl shrink-0 h-11 border-primary/20 hover:bg-primary/5 text-primary font-semibold"
          >
            <ChefHat className="size-4 mr-2" />
            Open Standalone KDS
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-xl shrink-0 h-11 font-semibold"
          >
            <RefreshCw className={cn("size-4 mr-2", refreshing && "animate-spin text-primary")} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
          
          {/* New / Confirmed Column */}
          <div className="flex flex-col bg-slate-100/50 dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm transition-colors">
            <div className="px-5 py-4 border-b border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between transition-colors">
              <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="size-5 text-blue-500 dark:text-blue-400" /> To Prepare
              </h2>
              <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-black px-3 py-1 rounded-full transition-colors">
                {pendingOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {pendingOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 space-y-3 transition-colors">
                  <Clock className="size-8 opacity-20" />
                  <p className="text-sm font-semibold">No pending orders</p>
                </div>
              ) : (
                pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Preparing Column */}
          <div className="flex flex-col bg-orange-50/50 dark:bg-orange-500/5 rounded-[32px] border border-orange-100 dark:border-orange-500/10 overflow-hidden shadow-sm transition-colors">
            <div className="px-5 py-4 border-b border-orange-100 dark:border-orange-500/10 bg-orange-50/80 dark:bg-orange-500/10 backdrop-blur-md flex items-center justify-between transition-colors">
              <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame className="size-5 text-orange-500 dark:text-orange-400" /> Preparing
              </h2>
              <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-sm font-black px-3 py-1 rounded-full transition-colors">
                {preparingOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {preparingOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-orange-300 dark:text-orange-500/40 space-y-3 transition-colors">
                  <Flame className="size-8 opacity-20" />
                  <p className="text-sm font-semibold">No active preparation</p>
                </div>
              ) : (
                preparingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="flex flex-col bg-green-50/50 dark:bg-green-500/5 rounded-[32px] border border-green-100 dark:border-green-500/10 overflow-hidden shadow-sm transition-colors">
            <div className="px-5 py-4 border-b border-green-100 dark:border-green-500/10 bg-green-50/80 dark:bg-green-500/10 backdrop-blur-md flex items-center justify-between transition-colors">
              <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500 dark:text-green-400" /> Ready
              </h2>
              <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-black px-3 py-1 rounded-full transition-colors">
                {readyOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {readyOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-green-400 dark:text-green-500/40 space-y-3 transition-colors">
                  <CheckCircle2 className="size-8 opacity-20" />
                  <p className="text-sm font-semibold">No ready orders waiting</p>
                </div>
              ) : (
                readyOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
