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

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [allOrders, allItems, allProducts] = await Promise.all([
        list("orders"),
        list("order_items"),
        list("products")
      ]);
      
      setOrders(allOrders);
      setOrderItems(allItems);
      setProducts(allProducts);
    } catch (error) {
      toast.error("Failed to load kitchen data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto-refresh every 10 seconds
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
    <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm flex flex-col hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between mb-3 border-b border-border/40 pb-3">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Order
          </span>
          <h3 className="font-serif text-lg font-bold text-foreground">
            #{order.order_number || order.id}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Time
          </span>
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Clock className="size-3 text-primary" />
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[250px] mb-4 space-y-2 custom-scrollbar pr-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start text-sm">
            <div className="bg-secondary px-2 py-0.5 rounded-md font-bold text-foreground min-w-[30px] text-center shrink-0">
              {item.quantity}x
            </div>
            <div className="flex-1 leading-tight pt-0.5">
              <span className="font-semibold text-foreground">{item.product_name}</span>
              {item.options && item.options !== "{}" && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {(() => {
                    try {
                      return Object.values(JSON.parse(item.options)).join(", ");
                    } catch (e) {
                      return String(item.options);
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 border-t border-border/40">
        {order.status === "PENDING" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
            className="w-full rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all font-bold"
          >
            Confirm Order
          </Button>
        )}
        {order.status === "CONFIRMED" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "PREPARING")}
            className="w-full rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all font-bold"
          >
            <Flame className="size-4 mr-2" />
            Start Preparing
          </Button>
        )}
        {order.status === "PREPARING" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "READY")}
            className="w-full rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all font-bold"
          >
            <CheckCircle2 className="size-4 mr-2" />
            Mark as Ready
          </Button>
        )}
        {order.status === "READY" && (
          <div className="w-full text-center py-2 rounded-xl bg-secondary/50 text-muted-foreground text-sm font-semibold flex items-center justify-center gap-2">
            <ShoppingBag className="size-4" />
            Waiting for Driver
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <ChefHat className="size-6 text-primary" /> Kitchen Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage live orders and update preparation status in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open("/kitchen/login", "_blank")}
            className="rounded-xl shrink-0 border-primary/20 hover:bg-primary/5 text-primary"
          >
            <ChefHat className="size-4 mr-2" />
            Open Standalone KDS
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-xl shrink-0"
          >
            <RefreshCw className={cn("size-4 mr-2", refreshing && "animate-spin")} />
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
          <div className="flex flex-col bg-secondary/20 rounded-3xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-card/50 flex items-center justify-between backdrop-blur-sm">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-blue-500" /> To Prepare
              </h2>
              <span className="bg-blue-500/20 text-blue-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {pendingOrders.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-10 opacity-60 font-medium">
                  No pending orders.
                </div>
              ) : (
                pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Preparing Column */}
          <div className="flex flex-col bg-orange-500/5 rounded-3xl border border-orange-500/20 overflow-hidden">
            <div className="p-4 border-b border-orange-500/20 bg-orange-500/10 flex items-center justify-between backdrop-blur-sm">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Flame className="size-4 text-orange-500" /> Preparing
              </h2>
              <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {preparingOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {preparingOrders.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-10 opacity-60 font-medium">
                  No orders currently preparing.
                </div>
              ) : (
                preparingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="flex flex-col bg-green-500/5 rounded-3xl border border-green-500/20 overflow-hidden">
            <div className="p-4 border-b border-green-500/20 bg-green-500/10 flex items-center justify-between backdrop-blur-sm">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" /> Ready for Pickup
              </h2>
              <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {readyOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {readyOrders.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-10 opacity-60 font-medium">
                  No ready orders waiting.
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
