import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  LogOut,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  RefreshCcw,
  Heart,
  LocateFixed,
  Settings,
  Ticket,
  Lock,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/food/navbar";
import { CartDrawer } from "@/components/food/cart-drawer";
import { PageTransition } from "@/components/shared/page-transition";
import { list, create, update } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, toggleCart } = useCart();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam ? tabParam.toUpperCase() : "MENU");
  
  // Settings & Coupons state
  const [coupons, setCoupons] = useState([]);
  const [settingsForm, setSettingsForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // New address state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", address_line: "", city: "" });
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data && data.address) {
          const addr = data.address;
          const cityMatch = ["Phnom Penh", "Kandal", "Siem Reap", "Sihanoukville", "Battambang", "Kampong Cham"].find(
            c => addr.city?.includes(c) || addr.state?.includes(c) || addr.province?.includes(c)
          );
          
          setNewAddress(prev => ({
            ...prev,
            city: cityMatch || prev.city || "Phnom Penh",
            address_line: data.display_name
          }));
          toast.success("Location found!");
        }
      } catch (err) {
        toast.error("Failed to get location address");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast.error("Please allow location permissions");
      setIsLocating(false);
    });
  };

  const loadFavorites = () => {
    try {
      const favs = JSON.parse(localStorage.getItem("customerFavorites") || "[]");
      setFavorites(favs);
    } catch (e) {}
  };

  const fetchProfileData = async (c) => {
    setLoading(true);
    try {
      const [allOrders, allAddresses, allCoupons] = await Promise.all([
        list("orders"),
        list("addresses"),
        list("coupons").catch(() => [])
      ]);
      setOrders(allOrders
        .filter(o => String(o.customer_id) === String(c.id) || o.customer_phone === c.phone)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setAddresses(allAddresses.filter(a => String(a.customer_id) === String(c.id)));
      setCoupons(allCoupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("customerAuth");
    if (!auth) {
      navigate("/login");
      return;
    }
    const c = JSON.parse(auth);
    setCustomer(c);
    setSettingsForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", password: "" });
    fetchProfileData(c);
    loadFavorites();

    const handleFavChange = () => loadFavorites();
    window.addEventListener("favoritesChanged", handleFavChange);
    return () => window.removeEventListener("favoritesChanged", handleFavChange);
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam.toUpperCase());
    } else {
      setActiveTab("MENU");
    }
  }, [location.search]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      const dataToUpdate = { name: settingsForm.name, phone: settingsForm.phone, email: settingsForm.email };
      if (settingsForm.password) {
        dataToUpdate.password_hash = settingsForm.password;
      }
      await update("customers", customer.id, dataToUpdate);
      
      const updatedCustomer = { ...customer, ...dataToUpdate };
      delete updatedCustomer.password;
      localStorage.setItem("customerAuth", JSON.stringify(updatedCustomer));
      setCustomer(updatedCustomer);
      setSettingsForm(prev => ({ ...prev, password: "" }));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await create("addresses", {
        customer_id: customer.id,
        ...newAddress,
        is_default: addresses.length === 0
      });
      setShowAddForm(false);
      setNewAddress({ label: "", address_line: "", city: "" });
      fetchProfileData(customer);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerAuth");
    navigate("/");
  };

  const handleReorder = async (orderId) => {
    try {
      const allItems = await list("order_items");
      const orderItems = allItems.filter(item => String(item.order_id) === String(orderId));
      
      if (orderItems.length === 0) {
        toast.error("Could not find items for this order.");
        return;
      }
      
      orderItems.forEach(item => {
        addItem({
          id: `${item.product_id}-${item.options || 'default'}`,
          originalId: item.product_id,
          name: item.product_name,
          price: item.unit_price,
          qty: item.quantity,
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop", // placeholder
          selectedOptions: item.options ? JSON.parse(item.options) : null
        });
      });
      
      toast.success("Items added to cart!");
      toggleCart();
    } catch (err) {
      toast.error("Failed to reorder items.");
    }
  };

  if (!customer) return null;

  const displayTab = activeTab === "MENU" ? "SETTINGS" : activeTab;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32 pb-16">
        <PageTransition>
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              
              {/* Sidebar Profile */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "bg-card border border-border/60 rounded-3xl p-6 h-fit shadow-warm-lg",
                  activeTab !== "MENU" ? "hidden lg:block" : "block"
                )}
              >
                <div className="lg:hidden mb-6">
                  <Button 
                    variant="ghost" 
                    className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/")}
                  >
                    <ArrowLeft className="size-5 mr-2" />
                    Back to Home
                  </Button>
                </div>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 overflow-hidden">
                    {customer.avatar ? (
                      <img src={customer.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="size-10 text-primary" />
                    )}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    {customer.name || "Foodie"}
                  </h2>
                  <p className="text-muted-foreground">{customer.phone || customer.email}</p>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className={cn("w-full justify-start", activeTab === "SETTINGS" ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    onClick={() => setActiveTab("SETTINGS")}
                  >
                    <Settings className="mr-3 size-5" />
                    Profile Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("w-full justify-start", activeTab === "ORDERS" ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    onClick={() => setActiveTab("ORDERS")}
                  >
                    <ShoppingBag className="mr-3 size-5" />
                    Order History
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("w-full justify-start", activeTab === "ADDRESSES" ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    onClick={() => setActiveTab("ADDRESSES")}
                  >
                    <MapPin className="mr-3 size-5" />
                    Saved Addresses
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("w-full justify-start", activeTab === "FAVORITES" ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    onClick={() => setActiveTab("FAVORITES")}
                  >
                    <Heart className="mr-3 size-5" />
                    Favorites
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("w-full justify-start", activeTab === "COUPONS" ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    onClick={() => setActiveTab("COUPONS")}
                  >
                    <Ticket className="mr-3 size-5" />
                    Coupons
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-8"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 size-5" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "space-y-6",
                  activeTab === "MENU" ? "hidden lg:block" : "block"
                )}
              >
                <div className="lg:hidden mb-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => { navigate("/profile"); setActiveTab("MENU"); }} 
                    className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-5 mr-2" />
                    Back to Menu
                  </Button>
                </div>

                {displayTab === "SETTINGS" && (
                  <>
                    <h3 className="font-serif text-3xl font-bold text-foreground mb-6">Profile Settings</h3>
                    <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8">
                      <form onSubmit={handleUpdateSettings} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <User className="size-4" /> Full Name
                            </label>
                            <Input 
                              required 
                              value={settingsForm.name} 
                              onChange={e => setSettingsForm(prev => ({...prev, name: e.target.value}))} 
                              className="rounded-xl border-border/60 bg-background/50 h-12" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Phone className="size-4" /> Phone Number
                            </label>
                            <Input 
                              required 
                              value={settingsForm.phone} 
                              onChange={e => setSettingsForm(prev => ({...prev, phone: e.target.value}))} 
                              className="rounded-xl border-border/60 bg-background/50 h-12" 
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Mail className="size-4" /> Email Address
                            </label>
                            <Input 
                              type="email"
                              value={settingsForm.email} 
                              onChange={e => setSettingsForm(prev => ({...prev, email: e.target.value}))} 
                              className="rounded-xl border-border/60 bg-background/50 h-12" 
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border/60">
                          <h4 className="font-serif text-xl font-bold text-foreground mb-4">Security</h4>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Lock className="size-4" /> New Password (leave blank to keep current)
                            </label>
                            <Input 
                              type="password"
                              placeholder="••••••••"
                              value={settingsForm.password} 
                              onChange={e => setSettingsForm(prev => ({...prev, password: e.target.value}))} 
                              className="rounded-xl border-border/60 bg-background/50 h-12 max-w-md" 
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button 
                            type="submit" 
                            size="lg" 
                            className="rounded-full px-8"
                            disabled={isUpdatingSettings}
                          >
                            {isUpdatingSettings ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </>
                )}

                {displayTab === "ORDERS" && (
                  <>
                    <h3 className="font-serif text-3xl font-bold text-foreground mb-6">
                      Recent Orders
                    </h3>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-card border border-border/60 rounded-3xl p-12 text-center text-muted-foreground">
                    <ShoppingBag className="size-16 mx-auto mb-4 opacity-20" />
                    <p>No orders yet. Time to crave something delicious!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-card border border-border/60 rounded-3xl p-6 transition-all hover:border-primary/50 cursor-pointer hover:shadow-warm"
                        onClick={() => navigate(`/track/${order.id}`)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono text-sm text-muted-foreground">#{order.order_number}</span>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                order.status === "DELIVERED" ? "bg-green-600/20 text-green-600" :
                                order.status === "CANCELLED" ? "bg-destructive/20 text-destructive" :
                                "bg-primary/20 text-primary"
                              )}>
                                {order.status}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Clock className="size-4 text-muted-foreground" />
                              {formatDate(order.created_at)}
                            </h4>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/60">
                          <span className="font-bold text-primary">${order.total}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-full text-xs h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(order.id);
                              }}
                            >
                              <RefreshCcw className="size-3 mr-1.5" /> Reorder
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-xs h-8 text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/track/${order.id}`);
                              }}
                            >
                              View Details <ChevronRight className="size-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </>
                )}

                {displayTab === "ADDRESSES" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-3xl font-bold text-foreground">Saved Addresses</h3>
                      <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-full">
                        <Plus className="size-4 mr-1" /> Add New
                      </Button>
                    </div>

                    {showAddForm && (
                      <form onSubmit={handleCreateAddress} className="bg-card border border-border/60 rounded-3xl p-6 mb-6 grid gap-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Address Label</label>
                            <Input required value={newAddress.label} onChange={e => setNewAddress(prev => ({...prev, label: e.target.value}))} placeholder="e.g. Home, Office, Condo" className="rounded-xl border-border/60" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">City / Province</label>
                            <select 
                              required 
                              value={newAddress.city} 
                              onChange={e => setNewAddress(prev => ({...prev, city: e.target.value}))} 
                              className="w-full h-10 px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="" disabled>Select a location</option>
                              <option value="Phnom Penh">Phnom Penh</option>
                              <option value="Kandal">Kandal</option>
                              <option value="Siem Reap">Siem Reap</option>
                              <option value="Sihanoukville">Sihanoukville</option>
                              <option value="Battambang">Battambang</option>
                              <option value="Kampong Cham">Kampong Cham</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-muted-foreground">Specific Details (Street, House No, etc.)</label>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                              onClick={handleAutoLocation}
                              disabled={isLocating}
                            >
                              <LocateFixed className={cn("size-3 mr-1", isLocating && "animate-spin")} />
                              {isLocating ? "Locating..." : "Use Current Location"}
                            </Button>
                          </div>
                          <Input required value={newAddress.address_line} onChange={e => setNewAddress(prev => ({...prev, address_line: e.target.value}))} placeholder="e.g. St 271, House 123, Toul Kork" className="rounded-xl border-border/60" />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                          <Button type="submit">Save Address</Button>
                        </div>
                      </form>
                    )}

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="bg-card border border-border/60 rounded-3xl p-12 text-center text-muted-foreground">
                        <MapPin className="size-16 mx-auto mb-4 opacity-20" />
                        <p>No saved addresses.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div key={addr.id} className="bg-card border border-border/60 rounded-3xl p-6 relative group">
                            {addr.is_default && <span className="absolute top-4 right-4 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                            <div className="size-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                              <MapPin className="size-5 text-muted-foreground" />
                            </div>
                            <h4 className="font-bold text-foreground text-lg mb-1">{addr.label}</h4>
                            <p className="text-sm text-muted-foreground">{addr.address_line}</p>
                            <p className="text-sm text-muted-foreground">{addr.city}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {displayTab === "FAVORITES" && (
                  <>
                    <h3 className="font-serif text-3xl font-bold text-foreground mb-6">Favorites</h3>
                    {favorites.length === 0 ? (
                      <div className="bg-card border border-border/60 rounded-3xl p-12 text-center text-muted-foreground">
                        <Heart className="size-16 mx-auto mb-4 opacity-20" />
                        <p>No favorites yet. Add some items you love!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {favorites.map(item => (
                          <div key={item.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                            <div className="aspect-square relative overflow-hidden bg-secondary">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let favs = JSON.parse(localStorage.getItem("customerFavorites") || "[]");
                                  favs = favs.filter(f => String(f.id) !== String(item.id));
                                  localStorage.setItem("customerFavorites", JSON.stringify(favs));
                                  window.dispatchEvent(new Event("favoritesChanged"));
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 shadow-sm"
                              >
                                <Heart className="size-4 fill-red-500 text-red-500" />
                              </button>
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                              <p className="text-primary font-bold text-sm mt-1">${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {displayTab === "COUPONS" && (
                  <>
                    <h3 className="font-serif text-3xl font-bold text-foreground mb-6">My Coupons</h3>
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : coupons.length === 0 ? (
                      <div className="bg-card border border-border/60 rounded-3xl p-12 text-center text-muted-foreground">
                        <Ticket className="size-16 mx-auto mb-4 opacity-20" />
                        <p>No coupons available right now.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-500"></span> Available Now
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {coupons.filter(c => c.active && (!c.expires_at || new Date(c.expires_at) > new Date())).map(coupon => (
                              <div key={coupon.id} className="bg-primary/5 border border-primary/20 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                                <div className="absolute -right-6 -top-6 size-24 bg-primary/10 rounded-full blur-2xl"></div>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                                      {coupon.code}
                                    </div>
                                    <h5 className="font-bold text-lg">
                                      {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : 
                                       coupon.discount_type === 'FREE_DELIVERY' ? 'FREE DELIVERY' : 
                                       `$${coupon.discount_value} OFF`}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mt-1">Min. spend: ${coupon.min_order_amount}</p>
                                  </div>
                                </div>
                                {coupon.expires_at && (
                                  <div className="mt-4 pt-3 border-t border-primary/10 text-xs text-primary font-semibold flex items-center gap-1.5">
                                    <Clock className="size-3" /> Valid until {new Date(coupon.expires_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ))}
                            {coupons.filter(c => c.active && (!c.expires_at || new Date(c.expires_at) > new Date())).length === 0 && (
                              <p className="text-sm text-muted-foreground">No available coupons.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold mb-4 text-muted-foreground flex items-center gap-2">
                            <span className="size-2 rounded-full bg-muted-foreground/30"></span> Used / Expired
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                            {coupons.filter(c => !c.active || (c.expires_at && new Date(c.expires_at) <= new Date())).map(coupon => (
                              <div key={coupon.id} className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="inline-block px-3 py-1 bg-secondary text-muted-foreground text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                                      {coupon.code}
                                    </div>
                                    <h5 className="font-bold text-muted-foreground">
                                      {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : 
                                       coupon.discount_type === 'FREE_DELIVERY' ? 'FREE DELIVERY' : 
                                       `$${coupon.discount_value} OFF`}
                                    </h5>
                                  </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-1.5">
                                  {coupon.active ? "Expired" : "Used or Inactive"}
                                </div>
                              </div>
                            ))}
                            {coupons.filter(c => !c.active || (c.expires_at && new Date(c.expires_at) <= new Date())).length === 0 && (
                              <p className="text-sm text-muted-foreground">No expired coupons.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

            </div>
          </div>
        </PageTransition>
      </main>
      <CartDrawer />
    </div>
  );
}
