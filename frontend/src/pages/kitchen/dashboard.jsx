import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { list, update } from "@/lib/api";
import { toast } from "sonner";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  ShoppingBag,
  RefreshCw,
  Flame,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/food-api";

export default function StandaloneKitchenDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  
  const [theme, setTheme] = useState(localStorage.getItem("kitchenTheme") || "light");
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  useEffect(() => {
    localStorage.setItem("kitchenTheme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = '#09090b';
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = '#f8fafc';
    }
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.classList.remove("dark");
    };
  }, [theme]);

  useEffect(() => {
    const auth = localStorage.getItem("kitchenAuth");
    if (!auth) {
      navigate("/kitchen/login", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(auth);
      if (!parsed.token) throw new Error("No token");
      setUser(parsed);
    } catch {
      navigate("/kitchen/login", { replace: true });
    }
  }, [navigate]);

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

  const handleSignOut = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/kitchen/login");
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
          product_image: product?.image || null
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
          <div key={idx} className="flex gap-3 items-start bg-slate-50 dark:bg-zinc-800/30 p-2 rounded-xl">
            <div className="size-12 shrink-0 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex items-center justify-center">
              {item.product_image ? (
                <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="size-6 text-slate-300 dark:text-zinc-600" />
              )}
            </div>
            <div className="bg-slate-100/80 dark:bg-zinc-800 px-2.5 py-1 rounded-xl font-black text-lg text-slate-900 dark:text-zinc-100 min-w-[40px] text-center shrink-0 border border-slate-200/60 dark:border-white/5 shadow-sm transition-colors mt-0.5">
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
            className="w-full h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all font-bold text-lg border border-blue-200 dark:border-blue-500/20"
          >
            Confirm Order
          </Button>
        )}
        {order.status === "CONFIRMED" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "PREPARING")}
            className="w-full h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all font-bold text-lg border border-orange-200 dark:border-orange-500/20"
          >
            <Flame className="size-5 mr-2" />
            Start Preparing
          </Button>
        )}
        {order.status === "PREPARING" && (
          <Button 
            onClick={() => updateOrderStatus(order.id, "READY")}
            className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all font-bold text-lg"
          >
            <CheckCircle2 className="size-5 mr-2" />
            Mark as Ready
          </Button>
        )}
        {order.status === "READY" && (
          <div className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 transition-colors">
            <ShoppingBag className="size-5" />
            Waiting for Driver
          </div>
        )}
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen font-sans selection:bg-orange-100 dark:selection:bg-orange-500/30 transition-colors">
      {/* Top Navigation Bar */}
      <header className="h-[calc(env(safe-area-inset-top)+5rem)] pt-[env(safe-area-inset-top)] border-b border-slate-200/60 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between px-6 shrink-0 z-10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
            <ChefHat className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Kitchen Display</h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">Flame & Crust</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{user.name || "Chef"}</span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider">{user.role_title || "Staff"}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/5 transition-colors">
            <div className={cn("size-2 rounded-full", user.status === "ONLINE" ? "bg-green-500 animate-pulse" : user.status === "BUSY" ? "bg-yellow-500" : "bg-slate-400 dark:bg-zinc-600")} />
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">{user.status || "ONLINE"}</span>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors active:scale-95"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-xl h-11 hidden sm:flex font-bold text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={cn("size-4 mr-2", refreshing && "animate-spin text-blue-600 dark:text-blue-400")} />
            Refresh
          </Button>

          <Button 
            variant="outline"
            onClick={handleSignOut}
            className="rounded-xl h-11 text-slate-600 dark:text-zinc-300 font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-colors"
          >
            <LogOut className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col h-[calc(100vh-5rem-env(safe-area-inset-top,0px))]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="size-12 rounded-full border-4 border-slate-200 dark:border-zinc-800 border-t-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-2">
            
            {/* New / Confirmed Column */}
            <div className="flex flex-col bg-slate-100/50 dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden transition-colors">
              <div className="px-6 py-5 border-b border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between transition-colors">
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
            <div className="flex flex-col bg-orange-50/50 dark:bg-orange-500/5 rounded-[32px] border border-orange-100 dark:border-orange-500/10 overflow-hidden transition-colors">
              <div className="px-6 py-5 border-b border-orange-100 dark:border-orange-500/10 bg-orange-50/80 dark:bg-orange-500/10 backdrop-blur-md flex items-center justify-between transition-colors">
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
            <div className="flex flex-col bg-green-50/50 dark:bg-green-500/5 rounded-[32px] border border-green-100 dark:border-green-500/10 overflow-hidden transition-colors">
              <div className="px-6 py-5 border-b border-green-100 dark:border-green-500/10 bg-green-50/80 dark:bg-green-500/10 backdrop-blur-md flex items-center justify-between transition-colors">
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
      </main>
    </div>
  );
}
