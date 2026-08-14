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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { PageTransition } from "@/components/shared/page-transition";
import { list, get } from "@/lib/api";
import { cn } from "@/lib/utils";

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
      <main className="flex-1 pt-24 sm:pt-28">
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
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    Order #{order.order_number}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Placed on {new Date(order.created_at).toLocaleString()}
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
                <div className="relative mb-12 mt-6">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
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
                        <div key={step.id} className="flex flex-col items-center">
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "size-12 rounded-full border-4 flex items-center justify-center bg-card z-10 transition-colors duration-500",
                              isCompleted ? "border-primary text-primary" : "border-secondary text-muted-foreground",
                              isCurrent && "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20"
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
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
