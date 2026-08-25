import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, MapPin, PhoneCall, CheckCircle2, Package, RefreshCw, Navigation, Wifi, WifiOff, User, Bike, Clock, AlertCircle, Check, ChevronRight, Sun, Moon, Map, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { list, get, update, getDriverMe, updateDriverLocation } from "@/lib/api";
import { cn } from "@/lib/utils";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getImageUrl } from "@/lib/food-api";

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

const LOCATION_INTERVAL = 5_000;

// ----------------- SUBCOMPONENTS -----------------

function DriverHeader({ driver, locationActive, theme, toggleTheme }) {
  return (
    <header className="shrink-0 h-[calc(env(safe-area-inset-top)+4rem)] pt-[env(safe-area-inset-top)] bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between px-4 lg:px-6 transition-colors z-40 relative shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-sm shrink-0 transition-colors">
          <FlameIcon className="size-5 text-white dark:text-zinc-900" />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-black text-xl text-slate-900 dark:text-zinc-100 tracking-tight leading-none">Flame & Crust</h1>
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-1 uppercase tracking-widest">Driver Dashboard</p>
        </div>
        <div className="sm:hidden">
          <h1 className="font-black text-lg text-slate-900 dark:text-zinc-100 tracking-tight">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full border border-slate-200/60 dark:border-white/5 transition-colors">
          <div className={cn("size-2.5 rounded-full shadow-sm", locationActive ? "bg-green-500 animate-pulse" : "bg-slate-400 dark:bg-zinc-600")} />
          <span className={cn("text-xs font-bold uppercase tracking-wider", locationActive ? "text-green-700 dark:text-green-400" : "text-slate-600 dark:text-zinc-400")}>
            {locationActive ? "Online" : "Offline"}
          </span>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors active:scale-95"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>

        <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800 hidden sm:block mx-1 transition-colors" />

        <Link to="/driver/profile" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{driver?.name?.split(' ')[0]}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Profile ▾</p>
          </div>
          <div className="relative">
            {driver?.profile_photo ? (
              <img src={driver.profile_photo} alt={driver.name} className="size-10 sm:size-11 rounded-full object-cover border-2 border-slate-100 dark:border-zinc-800 shadow-sm" />
            ) : (
              <div className="size-10 sm:size-11 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-800 flex items-center justify-center">
                <User className="size-5 text-slate-400 dark:text-zinc-500" />
              </div>
            )}
            <div className="md:hidden absolute -bottom-1 -right-1 size-4 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
              <div className={cn("size-2 rounded-full", locationActive ? "bg-green-500" : "bg-slate-400 dark:bg-zinc-600")} />
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}

// Simple flame icon SVG
function FlameIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function OrderTabs({ activeTab, setActiveTab, availableCount, activeCount }) {
  return (
    <div className="px-5 py-4 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-white/10 shrink-0 transition-colors z-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Deliveries</h2>
      </div>
      <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl transition-colors">
        <button 
          onClick={() => setActiveTab("available")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
            activeTab === "available" 
              ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm" 
              : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
          )}
        >
          <span>Available</span>
          {availableCount > 0 && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full transition-colors",
              activeTab === "available" ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            )}>{availableCount}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("my_deliveries")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
            activeTab === "my_deliveries" 
              ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm" 
              : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
          )}
        >
          <span>My Deliveries</span>
          {activeCount > 0 && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full transition-colors",
              activeTab === "my_deliveries" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            )}>{activeCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}

function DeliveryProgress({ status }) {
  const steps = [
    { id: "READY", label: "Ready" },
    { id: "OUT_FOR_DELIVERY", label: "En Route" },
    { id: "DELIVERED", label: "Done" },
  ];
  
  const currentIdx = steps.findIndex(s => s.id === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="py-3 px-1 mb-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-slate-100 dark:bg-zinc-800 rounded-full z-0 transition-colors" />
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[3px] bg-blue-600 dark:bg-blue-500 rounded-full z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `calc(${activeIdx * 50}% - 24px)` }}
        />
        
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 px-2 transition-colors">
              <div className={cn(
                "size-4 rounded-full border-2 transition-all duration-300",
                isCompleted ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                isCurrent && "ring-4 ring-blue-100 dark:ring-blue-900/30 scale-125"
              )} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider absolute top-7 whitespace-nowrap transition-colors",
                isCurrent ? "text-blue-600 dark:text-blue-400" : isCompleted ? "text-slate-700 dark:text-zinc-300" : "text-slate-400 dark:text-zinc-600"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8" /> 
    </div>
  );
}

function OrderCard({ order, activeTab, onAccept, onUpdateStatus }) {
  const totalItems = order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200/60 dark:border-white/10 mb-4 card-lift transition-all relative overflow-hidden group">
      
      {/* Decorative side border */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
        activeTab === "available" ? "bg-orange-500" : "bg-blue-500"
      )} />

      {/* Header Info */}
      <div className="flex items-start justify-between mb-5 pl-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
            Order ID
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-none">
            #{order.order_number || order.id}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
            Delivery Fee
          </span>
          <div className="text-xl font-black text-green-600 dark:text-green-400 tracking-tight leading-none">
            ${Number(order.delivery_fee || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Locations */}
      <div className="bg-slate-50 dark:bg-zinc-950/50 rounded-2xl p-4 mb-5 border border-slate-100 dark:border-white/5 transition-colors relative">
        {/* Timeline line */}
        <div className="absolute left-[29px] top-[32px] bottom-[32px] w-[2px] bg-slate-200 dark:bg-zinc-800" />
        
        {/* Restaurant */}
        <div className="flex gap-4 mb-4 relative z-10">
          <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-500/20">
            <FlameIcon className="size-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Pickup</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Flame & Crust</h4>
          </div>
        </div>

        {/* Customer */}
        <div className="flex gap-4 relative z-10">
          <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-500/20">
            <MapPin className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 pt-0.5 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Dropoff</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{order.customer?.name || "Customer"}</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {order.address?.address_line || "No address provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Gallery */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 mb-4">
        {order.items?.map((item, idx) => (
          <div key={idx} className="relative shrink-0 flex items-center justify-center size-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm transition-transform hover:scale-105">
            {item.product_image ? (
               <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
            ) : (
               <Package className="size-5 text-slate-400" />
            )}
            {item.quantity > 1 && (
               <div className="absolute bottom-0.5 right-0.5 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10 border border-white/20">
                 x{item.quantity}
               </div>
            )}
          </div>
        ))}
        {totalItems > 0 && (
           <div className="shrink-0 flex items-center gap-1 ml-2 text-sm text-slate-500 dark:text-zinc-400 font-medium">
             <span className="font-bold text-slate-700 dark:text-zinc-300">{totalItems}</span> items
           </div>
        )}
      </div>

      {/* Primary Actions */}
      <div>
        {activeTab === "available" ? (
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              Details
            </Button>
            <Button 
              onClick={() => onAccept(order.id)}
              className="flex-[2] h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 font-bold text-base shadow-sm active:scale-[0.98] transition-all border-none"
            >
              Accept Delivery
            </Button>
          </div>
        ) : (
          <div>
            <DeliveryProgress status={order.status} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              
              {order.status !== "OUT_FOR_DELIVERY" && order.status !== "DELIVERED" ? (
                <>
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=11.5564,104.9282"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Navigation className="size-4" />
                    Navigate to Restaurant
                  </a>
                  
                  <Button 
                    variant="outline"
                    onClick={() => onUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                    disabled={order.status !== "READY"}
                    className={cn(
                      "col-span-2 h-12 rounded-xl font-bold text-sm border-2 transition-all",
                      order.status !== "READY" 
                        ? "border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-600 cursor-not-allowed" 
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98]"
                    )}
                  >
                    {order.status === "READY" ? "Confirm Pick Up" : "Waiting for Kitchen..."}
                  </Button>
                </>
              ) : (
                <>
                  <a 
                    href={order.address?.latitude ? `https://www.google.com/maps/dir/?api=1&destination=${order.address.latitude},${order.address.longitude}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Navigation className="size-4" />
                    Navigate to Customer
                  </a>
                  
                  <Button 
                    onClick={() => onUpdateStatus(order.id, "DELIVERED")}
                    disabled={order.status !== "OUT_FOR_DELIVERY"}
                    className={cn(
                      "col-span-2 h-12 rounded-xl font-bold text-sm shadow-sm transition-all border-none",
                      order.status === "OUT_FOR_DELIVERY"
                        ? "bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
                    )}
                  >
                    Delivered
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab, onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-card-fade-in">
      <div className="size-20 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 transition-colors shadow-inner border border-slate-200/50 dark:border-white/5">
        {tab === "available" ? <Package className="size-8 text-slate-400 dark:text-zinc-500" /> : <Bike className="size-8 text-slate-400 dark:text-zinc-500" />}
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mb-2">
        {tab === "available" ? "No new deliveries" : "No active deliveries"}
      </h3>
      <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-[250px] leading-relaxed mb-6 font-medium">
        {tab === "available" 
          ? "You're all caught up. We'll notify you when new orders arrive." 
          : "You don't have any assigned deliveries right now."}
      </p>
      {tab === "available" && (
        <Button onClick={onRefresh} className="rounded-xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 active:scale-95 transition-all font-bold border-none shadow-sm">
          <RefreshCw className="size-4 mr-2" />
          Refresh Feed
        </Button>
      )}
    </div>
  );
}

// ----------------- MAIN PAGE COMPONENT -----------------

export default function DriverDashboardPage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("driverTheme") || "light");

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  useEffect(() => {
    localStorage.setItem("driverTheme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = '#09090b'; // zinc-950
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
    }
    
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.classList.remove("dark");
    };
  }, [theme]);

  const [driver, setDriver] = useState(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState("available"); // "available" or "my_deliveries"
  const [mobileView, setMobileView] = useState("list"); // "list" or "map" on mobile only
  
  const [myOrders, setMyOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const watchIdRef = useRef(null);
  const locationTimerRef = useRef(null);

  // ── Auth Check ──
  useEffect(() => {
    const auth = localStorage.getItem("driverAuth");
    if (!auth) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(auth);
      if (!parsed.token) {
        navigate("/login");
        return;
      }
      getDriverMe().then(freshDriver => {
        setDriver(freshDriver);
      }).catch(() => {
        localStorage.removeItem("driverAuth");
        navigate("/login");
      });
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // ── Real-Time Location Tracking ──
  const sendLocation = useCallback((lat, lng) => {
    updateDriverLocation(lat, lng).catch(() => {});
    setLastLocation({ lat, lng, time: new Date() });
  }, []);

  useEffect(() => {
    if (!driver) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationActive(true);
        sendLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => setLocationActive(false),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );
    watchIdRef.current = watchId;

    const timer = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }, LOCATION_INTERVAL);
    locationTimerRef.current = timer;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendLocation(pos.coords.latitude, pos.coords.longitude);
        setLocationActive(true);
      },
      () => setLocationActive(false),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(timer);
    };
  }, [driver, sendLocation]);

  // ── Fetch Assignments & Pool ──
  const fetchAllData = async () => {
    if (!driver) return;
    try {
      const allOrders = await list("orders");
      
      const assigned = allOrders.filter(o => 
        String(o.driver_id) === String(driver.id) && 
        o.status !== "DELIVERED" && 
        o.status !== "CANCELLED"
      );
      
      const available = allOrders.filter(o => 
        !o.driver_id && 
        ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status)
      );
      
      const [allAddresses, allCustomers, allOrderItems, allProducts] = await Promise.all([
        list("addresses").catch(() => []),
        list("customers").catch(() => []),
        list("order_items").catch(() => []),
        list("products").catch(() => [])
      ]);

      const enrich = (ordersList) => ordersList.map((o) => {
        const address = allAddresses.find(a => String(a.id) === String(o.address_id)) || null;
        const customer = allCustomers.find(c => String(c.id) === String(o.customer_id)) || null;
        const items = allOrderItems.filter(item => String(item.order_id) === String(o.id)).map(item => {
           const product = allProducts.find(p => String(p.id) === String(item.product_id));
           return {
             ...item,
             product_name: product?.name || item.product_name,
             product_image: product?.image || null
           };
        });
        return { ...o, address, customer, items };
      });
      
      setMyOrders(enrich(assigned).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setAvailableOrders(enrich(available).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (driver) fetchAllData();
  }, [driver]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update("orders", orderId, { status: newStatus });
      toast.success(`Updated to ${newStatus.replace(/_/g, " ")}`);
      fetchAllData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await update("orders", orderId, { driver_id: driver.id });
      toast.success("Delivery accepted!");
      setActiveTab("my_deliveries");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to accept delivery");
    }
  };

  if (!driver) return null;

  const currentDisplayOrders = activeTab === "available" ? availableOrders : myOrders;

  return (
    <div className="w-full h-[100dvh] flex flex-col font-sans transition-colors selection:bg-blue-100 dark:selection:bg-blue-900/50 bg-white dark:bg-zinc-950 overflow-hidden">
      
      {/* Full-width Header */}
      <DriverHeader 
        driver={driver} 
        locationActive={locationActive} 
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Full-Width Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden relative z-10">
        
        {/* Left Column (Deliveries) - 35% on Desktop */}
        <div className={cn(
          "w-full lg:w-[35%] xl:w-[400px] h-full flex flex-col bg-slate-50 dark:bg-zinc-950 border-r border-slate-200/80 dark:border-white/10 transition-colors z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]",
          mobileView === "map" && "hidden lg:flex"
        )}>
          
          <OrderTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            availableCount={availableOrders.length}
            activeCount={myOrders.length}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar relative">
            
            {/* Refresh action overlay */}
            <div className="absolute top-4 right-4 z-10 lg:hidden">
               <button 
                onClick={handleRefresh}
                className={cn("p-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 transition-colors active:scale-95", refreshing && "opacity-50 cursor-not-allowed")}
                disabled={refreshing}
              >
                <RefreshCw className={cn("size-4", refreshing && "animate-spin text-blue-600 dark:text-blue-400")} />
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-64 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-white/5" />
                <div className="h-64 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-white/5" />
              </div>
            ) : currentDisplayOrders.length === 0 ? (
              <EmptyState tab={activeTab} onRefresh={handleRefresh} />
            ) : (
              <div className="space-y-4 pb-20 lg:pb-0">
                {currentDisplayOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    activeTab={activeTab} 
                    onAccept={acceptOrder} 
                    onUpdateStatus={updateOrderStatus} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Large Map View) - 65% on Desktop */}
        <div className={cn(
          "flex-1 h-full w-full relative bg-slate-100 dark:bg-zinc-900",
          mobileView === "list" && "hidden lg:block"
        )}>
          {/* Refresh Action (Desktop Map Overlay) */}
          <div className="absolute top-6 right-6 z-[400] hidden lg:block">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl h-12 px-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-300 font-bold shadow-lg hover:bg-white dark:hover:bg-zinc-900 transition-all"
            >
              <RefreshCw className={cn("size-4 mr-2", refreshing && "animate-spin text-blue-600 dark:text-blue-400")} />
              Refresh Data
            </Button>
          </div>

          {lastLocation ? (
            <MapContainer 
              key={theme} // Force re-render on theme change to update tiles
              center={[lastLocation.lat, lastLocation.lng]} 
              zoom={15} 
              className="w-full h-full z-0" 
              zoomControl={false}
            >
              <TileLayer url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`} />
              <Marker position={[lastLocation.lat, lastLocation.lng]}>
                <Popup className="font-sans font-medium text-slate-900">You are here</Popup>
              </Marker>
              
              {/* Plot active orders on map */}
              {activeTab === "my_deliveries" && myOrders.map(order => {
                if (order.address?.latitude && order.address?.longitude) {
                  return (
                    <Marker key={order.id} position={[order.address.latitude, order.address.longitude]}>
                      <Popup className="font-sans font-medium">Order #{order.order_number || order.id}</Popup>
                    </Marker>
                  );
                }
                return null;
              })}

              <MapUpdater center={[lastLocation.lat, lastLocation.lng]} />
            </MapContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 bg-slate-100 dark:bg-zinc-900">
              <MapPin className="size-10 mb-4 opacity-30" />
              <p className="text-sm font-bold uppercase tracking-widest">Waiting for GPS Signal...</p>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Mobile Bottom Navigation (Floating) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <div className="flex items-center gap-1 bg-slate-900 dark:bg-white p-1.5 rounded-full shadow-xl">
          <button 
            onClick={() => setMobileView("list")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all",
              mobileView === "list" ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100" : "text-slate-400 dark:text-zinc-500 hover:text-slate-300 dark:hover:text-zinc-600"
            )}
          >
            <Menu className="size-4" />
            List
          </button>
          <button 
            onClick={() => setMobileView("map")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all",
              mobileView === "map" ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100" : "text-slate-400 dark:text-zinc-500 hover:text-slate-300 dark:hover:text-zinc-600"
            )}
          >
            <Map className="size-4" />
            Map
          </button>
        </div>
      </div>

    </div>
  );
}
