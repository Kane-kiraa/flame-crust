import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, PhoneCall, CheckCircle2, Package, RefreshCw, Navigation, Wifi, WifiOff, User, Bike, ChevronRight, Clock, ShoppingBag, Check, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { list, get, update, getDriverMe, updateDriverLocation } from "@/lib/api";
import { cn } from "@/lib/utils";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

const LOCATION_INTERVAL = 5_000; // 5 seconds

// ----------------- SUBCOMPONENTS -----------------

function DriverHeader({ driver, locationActive, refreshing, handleRefresh }) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {driver?.profile_photo ? (
              <img src={driver.profile_photo} alt={driver.name} className="size-12 rounded-full object-cover border-2 border-zinc-800" />
            ) : (
              <div className="size-12 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                <User className="size-6 text-zinc-400" />
              </div>
            )}
            <div className={cn("absolute bottom-0 right-0 size-3.5 border-2 border-zinc-950 rounded-full", locationActive ? "bg-green-500" : "bg-zinc-500")} />
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight text-white font-sans">
              Good morning, {driver?.name?.split(' ')[0]} 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <span>GPS</span>
                <span className={cn("flex items-center gap-1", locationActive ? "text-green-400" : "text-zinc-500")}>
                  <div className={cn("size-1.5 rounded-full", locationActive ? "bg-green-400 animate-pulse" : "bg-zinc-500")} />
                  {locationActive ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className={cn("p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group", refreshing && "opacity-50 cursor-not-allowed")}
          disabled={refreshing}
          title="Refresh dashboard"
        >
          <RefreshCw className={cn("size-5 text-zinc-300 group-hover:text-white transition-colors", refreshing && "animate-spin text-orange-400")} />
        </button>
      </div>
    </header>
  );
}

function DriverStats({ availableCount, activeCount, completedCount, locationActive }) {
  return (
    <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:bg-zinc-800/80 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Package className="size-4 text-orange-400" />
          <span className="text-xs font-medium text-zinc-400">Available</span>
        </div>
        <div className="text-2xl font-black text-white">{String(availableCount).padStart(2, '0')}</div>
      </div>
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:bg-zinc-800/80 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Bike className="size-4 text-blue-400" />
          <span className="text-xs font-medium text-zinc-400">Deliveries</span>
        </div>
        <div className="text-2xl font-black text-white">{String(activeCount).padStart(2, '0')}</div>
      </div>
      <div className="hidden lg:flex bg-zinc-900 border border-white/5 rounded-2xl p-4 flex-col justify-between hover:bg-zinc-800/80 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="size-4 text-green-400" />
          <span className="text-xs font-medium text-zinc-400">Completed</span>
        </div>
        <div className="text-2xl font-black text-white">{String(completedCount || 0).padStart(2, '0')}</div>
      </div>
      <div className="hidden lg:flex bg-zinc-900 border border-white/5 rounded-2xl p-4 flex-col justify-between hover:bg-zinc-800/80 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          {locationActive ? <Wifi className="size-4 text-green-400" /> : <WifiOff className="size-4 text-zinc-500" />}
          <span className="text-xs font-medium text-zinc-400">GPS Status</span>
        </div>
        <div className={cn("text-lg font-bold mt-1", locationActive ? "text-green-400" : "text-zinc-500")}>
          {locationActive ? "● Online" : "● Offline"}
        </div>
      </div>
    </div>
  );
}

function OrderTabs({ activeTab, setActiveTab, availableCount, activeCount }) {
  return (
    <div className="px-5 pb-2">
      <div className="flex p-1 bg-zinc-900 rounded-[20px] border border-white/5">
        <button 
          onClick={() => setActiveTab("available")}
          className={cn(
            "flex-1 py-3 px-4 rounded-[16px] text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
            activeTab === "available" 
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <span>Available</span>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full transition-all",
            activeTab === "available" ? "bg-white/20 text-white" : "bg-orange-500/10 text-orange-400"
          )}>{String(availableCount).padStart(2, '0')}</span>
        </button>
        <button 
          onClick={() => setActiveTab("my_deliveries")}
          className={cn(
            "flex-1 py-3 px-4 rounded-[16px] text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
            activeTab === "my_deliveries" 
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <span>My Deliveries</span>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full transition-all",
            activeTab === "my_deliveries" ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-400"
          )}>{String(activeCount).padStart(2, '0')}</span>
        </button>
      </div>
    </div>
  );
}

function DeliveryProgress({ status }) {
  const steps = [
    { id: "READY", label: "Ready" },
    { id: "OUT_FOR_DELIVERY", label: "Picked Up" },
    { id: "DELIVERED", label: "Delivered" },
  ];
  
  const currentIdx = steps.findIndex(s => s.id === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative mb-2">
        {/* Track */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-zinc-800 rounded-full z-0" />
        {/* Active Track */}
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `calc(${activeIdx * 50}% - 16px)` }}
        />
        
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5 bg-zinc-950 px-2">
              <div className={cn(
                "size-3 rounded-full border-2 transition-all duration-300",
                isCompleted ? "border-blue-500 bg-blue-500" : "border-zinc-700 bg-zinc-950",
                isCurrent && "ring-4 ring-blue-500/20 scale-125"
              )} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider absolute top-4 whitespace-nowrap",
                isCurrent ? "text-blue-400" : isCompleted ? "text-zinc-300" : "text-zinc-600"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* Spacer for absolute labels */}
    </div>
  );
}

function OrderCard({ order, activeTab, onAccept, onUpdateStatus }) {
  const totalItems = order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-white/10 transition-all duration-300 group">
      
      {/* Header: ID & Fee */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Order ID</span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5 group-hover:text-orange-100 transition-colors font-sans">
            #{order.order_number}
          </h3>
        </div>
        <div className="text-right bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest block mb-0.5">Delivery Fee</span>
          <div className="text-lg font-black text-green-400 leading-none">
            ${Number(order.delivery_fee || 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-zinc-800 mb-4" />

      {/* Customer & Address */}
      <div className="flex gap-4 mb-4">
        <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5">
          <User className="size-5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h4 className="text-sm font-bold text-white truncate font-sans">{order.customer?.name || "Customer"}</h4>
          <p className="text-xs text-zinc-400 leading-snug mt-1">
            {order.address?.address_line || "No address provided"}
            {order.address?.city ? `, ${order.address.city}` : ""}
          </p>
          {order.address?.notes && (
            <div className="mt-2.5 flex gap-2 items-start bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5">
              <AlertCircle className="size-4 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-orange-300 leading-relaxed">
                {order.address.notes}
              </p>
            </div>
          )}
        </div>
        
        {activeTab === "my_deliveries" && order.customer?.phone && (
          <a 
            href={`tel:${order.customer.phone}`}
            className="size-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 hover:bg-blue-500/20 active:scale-95 transition-all group/phone"
            title="Call Customer"
          >
            <PhoneCall className="size-4 text-blue-400 group-hover/phone:animate-pulse" />
          </a>
        )}
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="mb-5 bg-zinc-950 rounded-xl p-3 border border-zinc-800 flex items-start gap-3">
          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            <Package className="size-4 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              {totalItems} Items
            </p>
            <div className="flex flex-wrap gap-1.5">
              {order.items.slice(0, 3).map((item, idx) => (
                <span key={idx} className="text-xs font-medium text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md border border-white/5">
                  <span className="text-white font-bold mr-1">{item.quantity}x</span> 
                  {item.product_name}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="text-xs font-bold text-zinc-500 px-1 py-1">+{order.items.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions & Status */}
      <div className="mt-2 relative z-10">
        {activeTab === "available" ? (
          <Button 
            onClick={() => onAccept(order.id)}
            className="w-full rounded-[16px] h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-base shadow-lg shadow-orange-500/20 border-none active:scale-[0.98] transition-all duration-200"
          >
            <Check className="size-5 mr-2" />
            Accept Delivery
          </Button>
        ) : (
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <DeliveryProgress status={order.status} />
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline"
                onClick={() => onUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                disabled={order.status === "OUT_FOR_DELIVERY"}
                className={cn(
                  "flex-1 rounded-[14px] h-12 text-sm font-bold transition-all border-none active:scale-[0.98]",
                  order.status === "OUT_FOR_DELIVERY" 
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                <Bike className="size-4 mr-2" />
                Picked Up
              </Button>
              <Button 
                onClick={() => onUpdateStatus(order.id, "DELIVERED")}
                disabled={order.status !== "OUT_FOR_DELIVERY"}
                className={cn(
                  "flex-1 rounded-[14px] h-12 text-sm font-bold transition-all border-none active:scale-[0.98]",
                  order.status === "OUT_FOR_DELIVERY"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:from-green-400 hover:to-emerald-500"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
              >
                <CheckCircle2 className="size-4 mr-2" />
                Completed
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveMap({ lastLocation, locationActive }) {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-4 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Live Location</h2>
        <div className="flex items-center gap-1.5">
          <div className={cn("size-2 rounded-full", locationActive ? "bg-green-500 animate-pulse" : "bg-zinc-500")} />
          <span className={cn("text-[10px] font-bold uppercase", locationActive ? "text-green-500" : "text-zinc-500")}>
            {locationActive ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] lg:min-h-[400px] rounded-[20px] overflow-hidden border border-zinc-800 relative bg-zinc-950">
        {lastLocation ? (
          <MapContainer 
            center={[lastLocation.lat, lastLocation.lng]} 
            zoom={16} 
            className="w-full h-full" 
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Marker position={[lastLocation.lat, lastLocation.lng]}>
              <Popup className="font-sans">You are here</Popup>
            </Marker>
            <MapUpdater center={[lastLocation.lat, lastLocation.lng]} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
            <MapPin className="size-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">Waiting for GPS signal...</p>
          </div>
        )}
      </div>
      
      {lastLocation && (
        <div className="mt-4 px-2 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span className="flex items-center gap-1"><Navigation className="size-3" /> {lastLocation.lat.toFixed(4)}, {lastLocation.lng.toFixed(4)}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" /> {lastLocation.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse p-5 space-y-6">
      <div className="h-48 bg-zinc-900 rounded-3xl" />
      <div className="h-48 bg-zinc-900 rounded-3xl" />
      <div className="h-48 bg-zinc-900 rounded-3xl" />
    </div>
  );
}

function EmptyState({ tab, onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="size-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 mb-6 relative">
        <div className="absolute inset-0 bg-white/5 rounded-full animate-ping opacity-20" />
        {tab === "available" ? <Package className="size-8 text-zinc-600" /> : <Bike className="size-8 text-zinc-600" />}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-sans">
        {tab === "available" ? "No new orders" : "No active deliveries"}
      </h3>
      <p className="text-zinc-500 text-sm max-w-[250px] leading-relaxed mb-6">
        {tab === "available" 
          ? "You're all caught up. New delivery requests will appear here." 
          : "You don't have any assigned deliveries right now."}
      </p>
      {tab === "available" && (
        <Button variant="outline" onClick={onRefresh} className="rounded-xl h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white active:scale-[0.98] transition-all">
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      )}
    </div>
  );
}

// ----------------- MAIN PAGE COMPONENT -----------------

export default function DriverDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = '#09090b';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const [driver, setDriver] = useState(null);
  
  // Navigation
  const [mainTab, setMainTab] = useState("home"); // mobile only: "home" or "profile"
  const [activeTab, setActiveTab] = useState("available"); // "available" or "my_deliveries"
  
  const [myOrders, setMyOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  
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
      
      const completed = allOrders.filter(o => 
        String(o.driver_id) === String(driver.id) && 
        o.status === "DELIVERED"
      );
      setCompletedCount(completed.length);
      
      const available = allOrders.filter(o => 
        !o.driver_id && 
        ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status)
      );
      
      const [allAddresses, allCustomers, allOrderItems] = await Promise.all([
        list("addresses").catch(() => []),
        list("customers").catch(() => []),
        list("order_items").catch(() => [])
      ]);

      const enrich = (ordersList) => ordersList.map((o) => {
        const address = allAddresses.find(a => String(a.id) === String(o.address_id)) || null;
        const customer = allCustomers.find(c => String(c.id) === String(o.customer_id)) || null;
        const items = allOrderItems.filter(item => String(item.order_id) === String(o.id));
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

  const handleLogout = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (locationTimerRef.current) clearInterval(locationTimerRef.current);
    localStorage.removeItem("driverAuth");
    navigate("/login");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update("orders", orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      fetchAllData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await update("orders", orderId, { driver_id: driver.id });
      toast.success("Order accepted successfully!");
      setActiveTab("my_deliveries");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to accept order");
    }
  };

  if (!driver) return null;

  const currentDisplayOrders = activeTab === "available" ? availableOrders : myOrders;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      
      {/* Desktop/Tablet Layout */}
      <div className="max-w-[1400px] mx-auto hidden lg:flex h-screen overflow-hidden p-6 gap-6">
        
        {/* Left Column (Orders) */}
        <div className="w-[600px] flex flex-col bg-[#0a0a0a] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
          <DriverHeader 
            driver={driver} 
            locationActive={locationActive} 
            refreshing={refreshing} 
            handleRefresh={handleRefresh} 
          />
          <DriverStats 
            availableCount={availableOrders.length}
            activeCount={myOrders.length}
            completedCount={completedCount}
            locationActive={locationActive}
          />
          <OrderTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            availableCount={availableOrders.length}
            activeCount={myOrders.length}
          />
          
          <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide relative z-10">
            {loading ? (
              <LoadingSkeleton />
            ) : currentDisplayOrders.length === 0 ? (
              <EmptyState tab={activeTab} onRefresh={handleRefresh} />
            ) : (
              <div className="flex flex-col gap-4">
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
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Right Column (Map & Profile Actions) */}
        <div className="flex-1 flex flex-col gap-6">
          <LiveMap lastLocation={lastLocation} locationActive={locationActive} />
          
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                <User className="size-6 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-sans">Driver Profile</h2>
                <p className="text-sm font-medium text-zinc-400">{driver.phone}</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={handleLogout} 
              className="rounded-[16px] h-12 px-6 font-bold bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white border-white/10 hover:border-red-500/30 transition-all active:scale-[0.98]"
            >
              <LogOut className="size-4 mr-2" />
              Logout Session
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-[100dvh] relative">
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {mainTab === "home" && (
            <div className="max-w-lg mx-auto w-full">
              <DriverHeader 
                driver={driver} 
                locationActive={locationActive} 
                refreshing={refreshing} 
                handleRefresh={handleRefresh} 
              />
              <DriverStats 
                availableCount={availableOrders.length}
                activeCount={myOrders.length}
                completedCount={completedCount}
                locationActive={locationActive}
              />
              <OrderTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                availableCount={availableOrders.length}
                activeCount={myOrders.length}
              />
              
              <main className="px-5 pb-8 mt-2">
                {loading ? (
                  <LoadingSkeleton />
                ) : currentDisplayOrders.length === 0 ? (
                  <EmptyState tab={activeTab} onRefresh={handleRefresh} />
                ) : (
                  <div className="flex flex-col gap-4">
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
              </main>
            </div>
          )}

          {mainTab === "profile" && (
            <div className="max-w-lg mx-auto w-full p-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-24 flex flex-col min-h-full">
              <h1 className="font-bold text-2xl tracking-tight text-white mb-6 font-sans">Profile & Location</h1>
              
              <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {driver.profile_photo ? (
                      <img src={driver.profile_photo} alt={driver.name} className="size-20 rounded-full object-cover border-4 border-zinc-800" />
                    ) : (
                      <div className="size-20 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                        <User className="size-10 text-zinc-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 size-6 bg-zinc-900 rounded-full flex items-center justify-center">
                      <div className={cn("size-3 rounded-full", locationActive ? "bg-green-500" : "bg-zinc-500")} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight font-sans">{driver.name}</h2>
                    <p className="text-zinc-400 text-sm mt-0.5 font-medium">{driver.phone}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-zinc-400 text-sm font-medium">GPS Tracking</span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                      locationActive ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-400"
                    )}>
                      {locationActive ? <><Wifi className="size-3.5" /> Active</> : <><WifiOff className="size-3.5" /> Offline</>}
                    </div>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleLogout} 
                    className="w-full rounded-[16px] h-14 font-bold text-base bg-white/5 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all active:scale-[0.98]"
                  >
                    <LogOut className="size-5 mr-2" />
                    Logout Session
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-[350px]">
                <LiveMap lastLocation={lastLocation} locationActive={locationActive} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-lg mx-auto flex px-2 py-1">
            <button 
              onClick={() => setMainTab("home")}
              className={cn(
                "flex-1 py-3 my-1 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300",
                mainTab === "home" ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <Home className={cn("size-6 transition-all duration-300", mainTab === "home" && "scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")} />
              <span className="text-[10px] font-bold tracking-wide mt-1">Orders</span>
            </button>
            <button 
              onClick={() => setMainTab("profile")}
              className={cn(
                "flex-1 py-3 my-1 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300",
                mainTab === "profile" ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <User className={cn("size-6 transition-all duration-300", mainTab === "profile" && "scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")} />
              <span className="text-[10px] font-bold tracking-wide mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
