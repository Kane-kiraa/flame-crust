import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { list, update } from "@/lib/api";
import { toast } from "sonner";
import { RefreshCw, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import new components
import { KitchenSidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { CustomersView } from "./components/CustomersView";
import { PerformanceView } from "./components/PerformanceView";
import { OrderDetailsPanel } from "./components/OrderDetailsPanel";
import { ChefProfileView, NotificationsView, SettingsView } from "./components/MiscViews";

let cachedStandaloneKitchenProducts = [];

export default function KitchenDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState(() => cachedStandaloneKitchenProducts);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  
  const [theme, setTheme] = useState(localStorage.getItem("kitchenTheme") || "light");
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const fetchData = async (isInitial = false) => {
    try {
      const promises = [
        list("orders"),
        list("order_items"),
        list("customers")
      ];
      if (cachedStandaloneKitchenProducts.length === 0 || isInitial) {
        promises.push(list("products"));
      }
      
      const results = await Promise.all(promises);
      setOrders(results[0] || []);
      setOrderItems(results[1] || []);
      setCustomers(results[2] || []);
      if (results[3]) {
        cachedStandaloneKitchenProducts = results[3];
        setProducts(results[3]);
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

  const handleSignOut = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/kitchen/login");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update("orders", orderId, { status: newStatus });
      toast.success(`Order #${orderId} moved to ${newStatus.replace(/_/g, " ")}`);
      fetchData();
      
      // If we have an order selected and we updated it, we should update the selected order too
      if (selectedOrder && String(selectedOrder.id) === String(orderId)) {
        setSelectedOrder(prev => ({...prev, status: newStatus}));
      }
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

  // Dynamic real revenue calculation
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysCompletedOrders = orders.filter(o => 
    new Date(o.created_at) >= todayStart && 
    ['READY', 'COMPLETED', 'DELIVERED'].includes(o.status)
  );
  const totalOrdersToday = todaysCompletedOrders.length;
  
  const todayRevenue = todaysCompletedOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans selection:bg-orange-100 dark:selection:bg-orange-500/30">
      
      <KitchenSidebar activeView={activeView} setActiveView={setActiveView} user={user} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[calc(env(safe-area-inset-top)+4.5rem)] pt-[env(safe-area-inset-top)] border-b border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10 transition-colors">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight capitalize">
              {activeView.replace('-', ' ')}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
              Live Kitchen Status
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl h-11 hidden sm:flex font-bold text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700"
            >
              <RefreshCw className={cn("size-4 mr-2", refreshing && "animate-spin text-blue-600")} />
              Refresh
            </Button>

            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="rounded-xl h-11 text-slate-600 dark:text-zinc-300 font-bold bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200"
            >
              <LogOut className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-6 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-12 rounded-full border-4 border-slate-200 dark:border-zinc-800 border-t-orange-500 animate-spin" />
            </div>
          ) : (
            <>
              {activeView === 'dashboard' || activeView === 'orders' || activeView === 'preparing' || activeView === 'ready' ? (
                <DashboardView 
                  pendingOrders={pendingOrders}
                  preparingOrders={preparingOrders}
                  readyOrders={readyOrders}
                  updateOrderStatus={updateOrderStatus}
                  onOrderClick={setSelectedOrder}
                  totalOrdersToday={totalOrdersToday}
                  todayRevenue={todayRevenue}
                />
              ) : activeView === 'customers' ? (
                <CustomersView customers={customers} orders={orders} />
              ) : activeView === 'performance' ? (
                <PerformanceView orders={orders} />
              ) : activeView === 'chef-profile' ? (
                <ChefProfileView user={user} />
              ) : activeView === 'notifications' ? (
                <NotificationsView />
              ) : activeView === 'settings' ? (
                <SettingsView />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 font-bold">This section is coming soon.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Side Panel for Order Details */}
      <OrderDetailsPanel 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        user={user}
        customers={customers}
      />
    </div>
  );
}
