import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ShoppingBag, 
  Bike, 
  MapPin, 
  PhoneCall, 
  AlertCircle,
  Home,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/food/navbar";
import { PageTransition } from "@/components/shared/page-transition";
import { list, get } from "@/lib/api";
import { foodItems } from "@/lib/food-data";
import { cn, formatDate } from "@/lib/utils";

const STATUS_STEPS = [
  { id: "PENDING", label: "Order Placed", icon: Clock },
  { id: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { id: "PREPARING", label: "Preparing", icon: ChefHat },
  { id: "READY", label: "Ready", icon: ShoppingBag },
  { id: "OUT_FOR_DELIVERY", label: "On the Way", icon: Bike },
  { id: "DELIVERED", label: "Delivered", icon: MapPin },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [driver, setDriver] = useState(null);
  const [address, setAddress] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderData = async () => {
    try {
      const orderData = await get("orders", orderId);
      if (!orderData) throw new Error("Order not found");
      setOrder(orderData);

      if (orderData.driver_id) {
        const driverData = await get("drivers", orderData.driver_id);
        setDriver(driverData);
      }
      
      if (orderData.address_id) {
        try {
          const addressData = await get("addresses", orderData.address_id);
          setAddress(addressData);
        } catch(e) {}
      }

      try {
        const allItems = await list("order_items");
        setItems(allItems.filter(item => String(item.order_id) === String(orderData.id)));
      } catch(e) {}

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load order status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchOrderData, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-24">
          <AlertCircle className="size-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Couldn't load order</h2>
          <p className="text-muted-foreground mt-2 mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="rounded-full">Back to Home</Button>
        </main>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32 pb-16">
        <PageTransition>
          <div className="mx-auto max-w-3xl px-4 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 rounded-full text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>

            <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-10 shadow-warm-lg">
              <div className="flex justify-between items-start mb-8 border-b border-border/60 pb-6">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                    Order #{order.order_number}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Placed on <span className="font-medium text-foreground">{formatDate(order.created_at)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-primary">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {isCancelled ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-2xl text-center mb-8">
                  <AlertCircle className="size-10 mx-auto mb-2" />
                  <h2 className="text-xl font-bold">Order Cancelled</h2>
                  <p className="text-sm mt-1">This order was cancelled and will not be delivered.</p>
                </div>
              ) : (
                <div className="relative mb-12 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-10">
                  <div className="min-w-[480px] sm:min-w-0 relative px-8 sm:px-12 pt-6">
                    {/* Progress Line */}
                    <div className="absolute top-12 left-8 right-8 sm:left-12 sm:right-12 h-1 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary shadow-[0_0_10px_2px_rgba(239,68,68,0.7)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const Icon = step.icon;
                        return (
                          <div key={step.id} className="relative flex flex-col items-center">
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className={cn(
                                "size-12 rounded-full border-4 flex items-center justify-center bg-card z-10 transition-all duration-500",
                                isCompleted ? "border-primary text-primary" : "border-secondary text-muted-foreground",
                                isCurrent && "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse ring-4 ring-primary/30"
                              )}
                            >
                              <Icon className="size-5" />
                            </motion.div>
                            <span className={cn(
                              "text-[11px] sm:text-xs font-semibold mt-2 text-center absolute -bottom-6 w-20 -ml-10 left-1/2",
                              isCurrent ? "text-primary" : (isCompleted ? "text-foreground" : "text-muted-foreground")
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Driver Details */}
              {driver && (order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/40 rounded-2xl p-5 mb-8 border border-border/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl">🛵</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{driver.name}</h4>
                      <p className="text-xs text-muted-foreground">Your Delivery Partner</p>
                    </div>
                  </div>
                  <a href={`tel:${driver.phone}`} className="flex items-center gap-2 bg-background border border-border/60 px-4 py-2 rounded-full text-sm font-medium hover:text-primary hover:border-primary transition-colors">
                    <PhoneCall className="size-4" />
                    Call
                  </a>
                </motion.div>
              )}

              {/* Delivery Details & Order Summary */}
              <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/60">
                {/* Address Section */}
                {address && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 flex flex-col h-full"
                  >
                    <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
                      <Home className="size-5 text-primary" /> Delivery Address
                    </h3>
                    <div className="bg-secondary/20 backdrop-blur-md rounded-2xl p-5 border border-border/40 shadow-inner hover:border-primary/30 transition-colors duration-300 flex-1">
                      <p className="font-medium text-foreground mb-1">{address.address_line}</p>
                      <p className="text-sm text-muted-foreground mb-3">{address.city}</p>
                      {address.notes && (
                        <div className="text-xs bg-background/50 p-3 rounded-xl border border-border/40">
                          <span className="font-semibold text-primary">Note:</span> {address.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Order Summary */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 flex flex-col h-full"
                >
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
                    <Receipt className="size-5 text-primary" /> Order Summary
                  </h3>
                  <div className="bg-secondary/20 backdrop-blur-md rounded-2xl p-5 border border-border/40 shadow-inner hover:border-primary/30 transition-colors duration-300 flex-1 flex flex-col">
                    <div className="space-y-3 mb-4 flex-1 overflow-y-auto max-h-[250px] sm:max-h-[350px] pr-2 custom-scrollbar">
                      {items.map(item => {
                        const foodItem = foodItems.find(f => f.name === item.product_name) || {};
                        return (
                          <div key={item.id} className="flex justify-between items-center text-sm gap-3">
                            <div className="flex items-center gap-3">
                              <div className="size-10 sm:size-12 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border/50 shadow-sm flex items-center justify-center">
                                {foodItem.image ? (
                                  <img src={foodItem.image} alt={item.product_name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="size-5 sm:size-6 text-primary/60" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {item.quantity}x {item.product_name}
                                </span>
                                {item.options && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                                    {(() => {
                                      try {
                                        return Object.values(JSON.parse(item.options)).join(", ");
                                      } catch (e) {
                                        return String(item.options);
                                      }
                                    })()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-bold whitespace-nowrap">${Number(item.line_total).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-3 border-t border-border/60 space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${Number(order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span>${Number(order.delivery_fee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground pt-2 text-base">
                        <span>Total</span>
                        <span className="text-primary">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
