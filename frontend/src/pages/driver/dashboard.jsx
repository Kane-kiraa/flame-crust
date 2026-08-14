import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bike, MapPin, PhoneCall, CheckCircle2, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { list, get, update } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DriverDashboardPage() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("driverAuth");
    if (!auth) {
      navigate("/driver/login");
      return;
    }
    setDriver(JSON.parse(auth));
  }, [navigate]);

  const fetchAssignments = async () => {
    if (!driver) return;
    try {
      const allOrders = await list("orders");
      // Fetch only assigned orders that are active (not delivered/cancelled)
      const assigned = allOrders.filter(o => 
        String(o.driver_id) === String(driver.id) && 
        o.status !== "DELIVERED" && 
        o.status !== "CANCELLED"
      );
      
      // Fetch addresses for each order
      const ordersWithDetails = await Promise.all(assigned.map(async (o) => {
        let address = null;
        let customer = null;
        try {
          if (o.address_id) address = await get("addresses", o.address_id);
          if (o.customer_id) customer = await get("customers", o.customer_id);
        } catch (e) {
          // ignore
        }
        return { ...o, address, customer };
      }));
      
      setOrders(ordersWithDetails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (driver) fetchAssignments();
  }, [driver]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const handleLogout = () => {
    localStorage.removeItem("driverAuth");
    navigate("/driver/login");
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await update("orders", orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchAssignments();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bike className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">{driver.name}</h1>
              <p className="text-xs text-zinc-400">Driver Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className={cn("p-2 rounded-full hover:bg-zinc-800 transition-colors", refreshing && "animate-spin")}
            >
              <RefreshCw className="size-5 text-zinc-400" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="size-8 text-primary animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Package className="size-10 text-zinc-700" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Active Orders</h2>
            <p className="text-zinc-500 max-w-[250px]">You have no assigned deliveries right now. Take a break!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-xl relative overflow-hidden">
                {/* Accent line based on status */}
                <div className={cn(
                  "absolute top-0 left-0 bottom-0 w-1.5",
                  order.status === "READY" ? "bg-amber-500" :
                  order.status === "OUT_FOR_DELIVERY" ? "bg-blue-500" : "bg-zinc-700"
                )} />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-mono text-zinc-500 block mb-1">#{order.order_number}</span>
                    <h3 className="font-bold text-lg text-white">
                      {order.customer?.name || "Customer"}
                    </h3>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    order.status === "READY" ? "bg-amber-500/20 text-amber-400" :
                    order.status === "OUT_FOR_DELIVERY" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {order.status.replace(/_/g, " ")}
                  </div>
                </div>

                {order.address && (
                  <div className="flex items-start gap-3 mb-4 p-3 bg-zinc-950/50 rounded-xl">
                    <MapPin className="size-5 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-zinc-200">{order.address.address_line}</p>
                      <p className="text-sm text-zinc-400">{order.address.city}</p>
                      {order.address.notes && (
                        <p className="text-xs text-amber-400/80 mt-1 italic">Note: {order.address.notes}</p>
                      )}
                    </div>
                  </div>
                )}

                {order.customer && (
                  <a href={`tel:${order.customer.phone}`} className="flex items-center gap-3 w-full p-3 rounded-xl border border-zinc-800 mb-6 hover:bg-zinc-800 transition-colors">
                    <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <PhoneCall className="size-4 text-green-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Call Customer</p>
                      <p className="text-xs text-zinc-500">{order.customer.phone}</p>
                    </div>
                  </a>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3 mt-auto">
                  {order.status === "READY" && (
                    <Button 
                      onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                      className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
                    >
                      <Bike className="size-5 mr-2" /> Start Delivery
                    </Button>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <Button 
                      onClick={() => updateStatus(order.id, "DELIVERED")}
                      className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
                    >
                      <CheckCircle2 className="size-5 mr-2" /> Mark Delivered
                    </Button>
                  )}
                  {(!["READY", "OUT_FOR_DELIVERY"].includes(order.status)) && (
                    <Button disabled className="w-full h-14 rounded-2xl bg-zinc-800 text-zinc-500 font-bold text-lg">
                      Waiting for restaurant
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
