import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Receipt,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/food/navbar";
import { PageTransition } from "@/components/shared/page-transition";
import { list, get } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/food-api";

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

// Component to dynamically center map when driver moves
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderData = async () => {
    try {
      const orderData = await get("orders", orderId);
      if (!orderData) throw new Error("Order not found");
      setOrder(orderData);

      if (orderData.driverId) {
        const driverData = await get("drivers", orderData.driverId);
        setDriver(driverData);
      }
      
      if (orderData.addressId) {
        try {
          const addressData = await get("addresses", orderData.addressId);
          setAddress(addressData);
        } catch(e) {}
      }

      try {
        // Fetch only if items haven't been loaded yet to save bandwidth on polling
        if (items.length === 0) {
          const allItems = await list("order_items");
          setItems(allItems.filter(item => String(item.orderId) === String(orderData.id)));
          
          const allProducts = await list("products");
          setProducts(allProducts);
        }
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
    // Poll every 3 seconds for real-time live map updates
    const interval = setInterval(fetchOrderData, 3000);
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
        <main className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-[calc(4.5rem+env(safe-area-inset-top))]">
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
  
  const hasDriverLocation = driver && driver.latitude && driver.longitude;
  const driverPos = hasDriverLocation ? [driver.latitude, driver.longitude] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-32 pb-16">
        <PageTransition>
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-4 sm:p-10 shadow-warm-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-4 sm:mb-6 -ml-2 sm:-ml-4 rounded-full text-foreground/70 hover:text-foreground flex items-center"
              >
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>

              <div className="flex flex-col sm:flex-row justify-between items-start mb-2 sm:mb-4 border-b border-border/60 pb-4 sm:pb-6 gap-2 sm:gap-3">
                <div>
                  <h1 className="font-serif text-lg sm:text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm break-all">
                    Order #{order.orderNumber || order.id}
                  </h1>
                  <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Placed on <span className="font-medium text-foreground">{formatDate(order.createdAt)}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-serif text-lg sm:text-2xl font-bold text-primary">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {isCancelled ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-2xl text-center mb-6">
                  <AlertCircle className="size-10 mx-auto mb-2" />
                  <h2 className="text-xl font-bold">Order Cancelled</h2>
                  <p className="text-sm mt-1">This order was cancelled and will not be delivered.</p>
                </div>
              ) : (
                <div className="relative mb-6 sm:mb-8 mt-0 sm:mt-2 pb-8 w-full max-w-full">
                  <div className="relative pt-6 w-full px-2 sm:px-12">
                    {/* Progress Line */}
                    <div className="absolute top-[2.1rem] sm:top-12 left-4 right-4 sm:left-12 sm:right-12 h-1 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary shadow-[0_0_10px_2px_rgba(239,68,68,0.7)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between w-full">
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
                                "size-7 sm:size-12 rounded-full border-[3px] sm:border-4 flex items-center justify-center bg-card z-10 transition-all duration-500",
                                isCompleted ? "border-primary text-primary" : "border-secondary text-muted-foreground",
                                isCurrent && "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse ring-4 ring-primary/30"
                              )}
                            >
                              <Icon className="size-3 sm:size-5" />
                            </motion.div>
                            <span className={cn(
                              "text-[8px] sm:text-xs font-semibold mt-2 text-center absolute -bottom-5 sm:-bottom-6 w-14 sm:w-20 -ml-7 sm:-ml-10 left-1/2 leading-tight",
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

              {/* Live Map & Driver Details */}
              {driver && (order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") && (
                <div className="mb-8 space-y-4">
                  {/* Driver Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary/40 rounded-2xl p-5 border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {driver.profilePhoto ? (
                        <img src={driver.profilePhoto} alt={driver.name} className="size-14 rounded-full object-cover border-2 border-primary/50 shadow-sm" />
                      ) : (
                        <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                          <Bike className="size-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                          {driver.name}
                          <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Assigned</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">{driver.vehicleInfo || "Delivery Partner"}</p>
                        {order.status === "OUT_FOR_DELIVERY" && (
                          <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                            <Navigation className="size-3" /> Heading to your location...
                          </p>
                        )}
                      </div>
                    </div>
                    <a href={`tel:${driver.phone}`} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-background border border-border/60 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:text-primary hover:border-primary transition-all active:scale-95">
                      <PhoneCall className="size-4" />
                      Call Driver
                    </a>
                  </motion.div>

                  {/* Map Section */}
                  {hasDriverLocation && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-border/50 shadow-inner relative z-0"
                    >
                      <MapContainer center={driverPos} zoom={15} className="w-full h-full" zoomControl={false}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={driverPos}>
                          <Popup className="font-sans">
                            <div className="text-center">
                              <p className="font-bold">{driver.name}</p>
                              <p className="text-xs text-muted-foreground">Current Location</p>
                            </div>
                          </Popup>
                        </Marker>
                        <MapUpdater center={driverPos} />
                      </MapContainer>
                      
                      {/* Overlay Indicator */}
                      <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-border text-xs font-bold flex items-center gap-2">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                        Live Tracking
                      </div>
                    </motion.div>
                  )}
                  {!hasDriverLocation && order.status === "OUT_FOR_DELIVERY" && (
                    <div className="w-full p-4 rounded-xl bg-secondary/30 text-center text-sm text-muted-foreground border border-border border-dashed">
                      Waiting for GPS signal from the driver...
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Details & Order Summary */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-5 sm:pt-6 border-t border-border/60">
                {/* Address Section */}
                {address && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2 sm:space-y-4 flex flex-col h-full"
                  >
                    <h3 className="font-serif text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                      <Home className="size-4 sm:size-5 text-primary" /> Delivery Address
                    </h3>
                    <div className="bg-secondary/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-border/40 shadow-inner hover:border-primary/30 transition-colors duration-300 flex-1">
                      <p className="font-medium text-sm sm:text-base text-foreground mb-1">{address.addressLine}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">{address.city}</p>
                      {address.notes && (
                        <div className="text-xs bg-background/50 p-2.5 sm:p-3 rounded-xl border border-border/40">
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
                  className="space-y-2 sm:space-y-4 flex flex-col h-full"
                >
                  <h3 className="font-serif text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                    <Receipt className="size-4 sm:size-5 text-primary" /> Order Summary
                  </h3>
                  <div className="bg-secondary/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-border/40 shadow-inner hover:border-primary/30 transition-colors duration-300 flex-1 flex flex-col">
                    <div className="space-y-2 sm:space-y-3 mb-4 flex-1 overflow-y-auto max-h-[250px] sm:max-h-[350px] pr-2 custom-scrollbar">
                      {items.map(item => {
                        const dbProduct = products.find(p => String(p.id) === String(item.productId));
                        const displayImage = dbProduct ? getImageUrl(dbProduct.image) : "/images/library/pizza.jpg";
                        return (
                          <Link key={item.id} to={`/product/${item.productId}`} className="flex justify-between items-center text-sm gap-3 p-2 -mx-2 rounded-xl hover:bg-secondary/40 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <div className="size-8 sm:size-12 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border/50 shadow-sm flex items-center justify-center">
                                {displayImage ? (
                                  <img src={displayImage} alt={item.productName} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="size-4 sm:size-6 text-primary/60" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs sm:text-sm text-foreground">
                                  {item.quantity}x {item.productName}
                                </span>
                                {item.options && (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
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
                            <span className="font-bold text-xs sm:text-sm whitespace-nowrap">${Number(item.lineTotal || 0).toFixed(2)}</span>
                          </Link>
                        );
                      })}
                      {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 opacity-60">
                          <ShoppingBag className="size-10 mb-3" />
                          <p className="text-xs sm:text-sm text-center">No items found for this order.<br/>(This might be an older order)</p>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 sm:pt-3 border-t border-border/60 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${Number(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span>${Number(order.deliveryFee || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground pt-1.5 sm:pt-2 text-sm sm:text-base">
                        <span>Total</span>
                        <span className="text-primary">${Number(order.total || 0).toFixed(2)}</span>
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
