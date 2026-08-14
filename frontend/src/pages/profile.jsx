import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { PageTransition } from "@/components/shared/page-transition";
import { list, create } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { addItem, toggleCart } = useCart();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ORDERS");
  
  // New address state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", address_line: "", city: "" });

  const loadFavorites = () => {
    try {
      const favs = JSON.parse(localStorage.getItem("customerFavorites") || "[]");
      setFavorites(favs);
    } catch (e) {}
  };

  const fetchProfileData = async (c) => {
    setLoading(true);
    try {
      const [allOrders, allAddresses] = await Promise.all([
        list("orders"),
        list("addresses")
      ]);
      setOrders(allOrders
        .filter(o => String(o.customer_id) === String(c.id) || o.customer_phone === c.phone)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setAddresses(allAddresses.filter(a => String(a.customer_id) === String(c.id)));
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
    fetchProfileData(c);
    loadFavorites();

    const handleFavChange = () => loadFavorites();
    window.addEventListener("favoritesChanged", handleFavChange);
    return () => window.removeEventListener("favoritesChanged", handleFavChange);
  }, [navigate]);

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
                className="bg-card border border-border/60 rounded-3xl p-6 h-fit shadow-warm-lg"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <User className="size-10 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    {customer.name || "Foodie"}
                  </h2>
                  <p className="text-muted-foreground">{customer.phone}</p>
                </div>

                <div className="space-y-2">
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
                className="space-y-6"
              >
                {activeTab === "ORDERS" ? (
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
                        className="bg-card border border-border/60 rounded-3xl p-6 transition-all hover:border-primary/50"
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
                              {new Date(order.created_at).toLocaleDateString()}
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
                              onClick={() => handleReorder(order.id)}
                            >
                              <RefreshCcw className="size-3 mr-1.5" /> Reorder
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-xs h-8 text-muted-foreground"
                              onClick={() => navigate(`/track/${order.id}`)}
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
                ) : (
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
                          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Specific Details (Street, House No, etc.)</label>
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
                {activeTab === "FAVORITES" && (
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
              </motion.div>

            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
