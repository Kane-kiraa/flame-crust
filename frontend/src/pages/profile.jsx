import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Camera,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Award,
  Loader2,
  Pencil,
  Star,
  Building2,
  Navigation2,
  ExternalLink
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/food/navbar";
import { CartDrawer } from "@/components/food/cart-drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageTransition } from "@/components/shared/page-transition";
import { MapPicker } from "@/components/food/map-picker";
import { list, create, update, get, remove } from "@/lib/api";
import { fetchDashboard, getImageUrl } from "@/lib/food-api";
import { useCart } from "@/lib/cart-store";
import { useTheme } from "@/components/theme-provider.jsx";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, toggleCart } = useCart();
  const { theme, setTheme } = useTheme();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam ? tabParam.toUpperCase() : "MENU");
  
  // Settings & Coupons state
  const [coupons, setCoupons] = useState([]);
  const [settingsForm, setSettingsForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", oldPassword: "" });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  
  // OTP Reset fields in profile
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddressDetails, setSelectedAddressDetails] = useState(null);
  const [allOrderItems, setAllOrderItems] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: "", address_line: "", city: "" });
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);

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
          
          if (editingAddress) {
            setEditingAddress(prev => ({
              ...prev,
              city: cityMatch || prev?.city || "Phnom Penh",
              address_line: data.display_name
            }));
          } else {
            setNewAddress(prev => ({
              ...prev,
              city: cityMatch || prev?.city || "Phnom Penh",
              address_line: data.display_name
            }));
          }
          toast.success("Location found via GPS!");
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
      const [allOrders, allAddresses, allCoupons, items, freshCustomer, productsList] = await Promise.all([
        list("orders"),
        list("addresses"),
        list("coupons").catch(() => []),
        list("order_items").catch(() => []),
        get("customers", c.id).catch(() => null),
        list("products").catch(() => [])
      ]);
      setOrders(allOrders
        .filter(o => String(o.customer_id) === String(c.id) || o.customer_phone === c.phone)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setAddresses(allAddresses.filter(a => String(a.customer_id) === String(c.id)));
      setCoupons(allCoupons);
      setAllOrderItems(items || []);
      setAllProducts(productsList || []);

      // Verify if password is set on the customer
      if (freshCustomer && freshCustomer.password_hash) {
        setHasPassword(true);
      } else {
        setHasPassword(false);
      }
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
    setSettingsForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", avatar: c.avatar || c.profile_image || c.image_url || "", password: "", confirmPassword: "", oldPassword: "" });
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

  // Send OTP for Forgot Password inside Profile Settings
  const handleSendForgotOTP = async () => {
    if (!settingsForm.email) {
      toast.error("Email is required to send OTP.");
      return;
    }
    setIsSendingOTP(true);
    try {
      const { API_URL } = await import("@/lib/api");
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: settingsForm.email }),
      });
      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }
      toast.success("OTP sent to your email!");
      setShowOTPDialog(true);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Verify OTP for Forgot Password inside Profile Settings
  const handleVerifyForgotOTP = async () => {
    if (otpCode.length < 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }
    setIsVerifyingOTP(true);
    try {
      const { API_URL } = await import("@/lib/api");
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: settingsForm.email, otp: otpCode }),
      });
      if (!response.ok) {
        throw new Error("Invalid or expired OTP");
      }
      toast.success("OTP verified! You can now create your new password without typing the current one.");
      setHasPassword(false); // Reset hasPassword locally so they don't have to fill oldPassword
      setShowOTPDialog(false);
      setOtpCode("");
    } catch (err) {
      toast.error(err.message || "Verification failed.");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const { uploadImageToCloudinary } = await import("@/lib/cloudinary");
      const uploadedUrl = await uploadImageToCloudinary(file);
      setSettingsForm((prev) => ({ ...prev, avatar: uploadedUrl }));
      
      // Auto-save to customer profile immediately
      if (customer) {
        try {
          if (customer.id) {
            await update("customers", customer.id, { avatar: uploadedUrl });
          }
        } catch (e) {
          console.warn("Could not sync avatar to backend:", e);
        }
        const updatedCustomer = { ...customer, avatar: uploadedUrl };
        delete updatedCustomer.password;
        localStorage.setItem("customerAuth", JSON.stringify(updatedCustomer));
        setCustomer(updatedCustomer);
        window.dispatchEvent(new Event("authChanged"));
      }
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      const dataToUpdate = { name: settingsForm.name, phone: settingsForm.phone, email: settingsForm.email, avatar: settingsForm.avatar };
      await update("customers", customer.id, dataToUpdate);
      
      const updatedCustomer = { ...customer, ...dataToUpdate };
      delete updatedCustomer.password;
      localStorage.setItem("customerAuth", JSON.stringify(updatedCustomer));
      setCustomer(updatedCustomer);
      window.dispatchEvent(new Event("authChanged"));
      toast.success("Profile information updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile information");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    if (!settingsForm.password) {
      toast.error("Please enter a new password.");
      return;
    }
    setIsUpdatingSettings(true);
    
    // Hash password to SHA-256
    const sha256 = async (str) => {
      const buf = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    try {
      // 1. We no longer fetch all customers to check old password client-side
      // The backend AdminCrudController will hash the new password.
      // We skip the old password check on the frontend to avoid exposing hashes.
      
      const dataToUpdate = { name: customer.name, phone: customer.phone, email: customer.email };
      
      // Require double-check verification password validation
      if (settingsForm.password !== settingsForm.confirmPassword) {
        toast.error("New password and confirm password do not match.");
        setIsUpdatingSettings(false);
        return;
      }

      if (hasPassword && !settingsForm.oldPassword) {
        toast.error("Please enter your current password to confirm changes.");
        setIsUpdatingSettings(false);
        return;
      }
      
      dataToUpdate.password = settingsForm.password;
      
      await update("customers", customer.id, dataToUpdate);
      
      const updatedCustomer = { ...customer, ...dataToUpdate };
      delete updatedCustomer.password;
      localStorage.setItem("customerAuth", JSON.stringify(updatedCustomer));
      setCustomer(updatedCustomer);
      window.dispatchEvent(new Event("authChanged"));
      setSettingsForm(prev => ({ ...prev, password: "", confirmPassword: "", oldPassword: "" }));
      setHasPassword(true);
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error("Failed to update password");
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
      toast.success("New address saved!");
    } catch (err) {
      toast.error("Failed to add address");
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!editingAddress) return;
    try {
      await update("addresses", editingAddress.id, editingAddress);
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? editingAddress : a));
      setEditingAddress(null);
      toast.success("Address updated successfully!");
    } catch (err) {
      toast.error("Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await remove("addresses", addressId);
      setAddresses(prev => prev.filter(a => a.id !== addressId));
      if (selectedAddressDetails?.id === addressId) setSelectedAddressDetails(null);
      toast.success("Address removed!");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await Promise.all(
        addresses.map(a => 
          update("addresses", a.id, { ...a, is_default: a.id === addressId })
        )
      );
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addressId })));
      toast.success("Default delivery address updated!");
    } catch (err) {
      toast.error("Failed to set default address");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerAuth");
    localStorage.removeItem("adminAuth");
    window.dispatchEvent(new Event("authChanged"));
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
        let optionsObj = null;
        try { if (item.options) optionsObj = JSON.parse(item.options); } catch (e) {}
        
        const optionString = optionsObj && Object.keys(optionsObj).length > 0 
          ? Object.values(optionsObj).join('-') 
          : '';

        addItem({
          id: optionString ? `${item.product_id}-${optionString}` : item.product_id,
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

  const isAdmin = Boolean(
    localStorage.getItem("adminAuth") ||
    (customer && ["ADMIN", "MANAGER", "STAFF"].includes((customer.role || "").toUpperCase()))
  );

  const displayTab = activeTab === "MENU" ? "SETTINGS" : activeTab;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-[calc(3.75rem+env(safe-area-inset-top))] sm:pt-32 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-16">
        <PageTransition>
          <div className="mx-auto max-w-5xl px-3 sm:px-4">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              
              {/* Sidebar Profile / Mobile Hub */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  activeTab !== "MENU" ? "hidden lg:block" : "block",
                  "space-y-4 lg:bg-card/50 lg:border lg:border-border/60 lg:rounded-3xl lg:p-6 lg:h-fit lg:shadow-warm-lg"
                )}
              >
                {/* 1. VIP Profile Hero Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-secondary/60 border border-border/70 p-6 text-center shadow-warm">
                  {/* Decorative subtle ambient glows */}
                  <div className="absolute -top-12 -right-12 size-36 rounded-full bg-primary/15 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 size-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

                  {/* Avatar with luxury golden ring & edit camera badge */}
                  <div className="relative mx-auto size-24 sm:size-28 mb-3.5 group">
                    <div className="size-full rounded-full ring-4 ring-primary/30 p-1 bg-background/80 shadow-md">
                      <div className="size-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="size-12 text-primary" />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("SETTINGS")}
                      className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-background hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title="Change Photo"
                    >
                      <Camera className="size-4" />
                    </button>
                  </div>

                  {/* User Name & Phone */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        {customer.name || "Flame Foodie"}
                      </h2>
                      <span className="inline-flex items-center text-amber-500" title="Flame VIP Member">
                        <Sparkles className="size-4.5 fill-amber-500" />
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                      {customer.phone || customer.email}
                    </p>
                  </div>

                  {/* Member Badge & Admin Panel Pill */}
                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 shadow-2xs">
                      <Flame className="size-3.5 fill-primary" />
                      VIP Foodie Member
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => navigate("/admin/dashboard")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShieldCheck className="size-3.5" />
                        Admin Panel →
                      </button>
                    )}
                  </div>

                  {/* 4 Interactive Quick Stat Tiles */}
                  <div className="mt-5 grid grid-cols-4 gap-2 pt-4 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => setActiveTab("ORDERS")}
                      className="flex flex-col items-center p-2 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/30 transition-all cursor-pointer group/stat active:scale-95"
                    >
                      <span className="font-serif text-lg font-bold text-foreground group-hover/stat:text-primary transition-colors">
                        {orders.length}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Orders</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("COUPONS")}
                      className="flex flex-col items-center p-2 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/30 transition-all cursor-pointer group/stat active:scale-95"
                    >
                      <span className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400 group-hover/stat:text-emerald-500 transition-colors">
                        {coupons.length}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Coupons</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("FAVORITES")}
                      className="flex flex-col items-center p-2 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/30 transition-all cursor-pointer group/stat active:scale-95"
                    >
                      <span className="font-serif text-lg font-bold text-rose-500 group-hover/stat:text-rose-600 transition-colors">
                        {favorites.length}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Favorites</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("ADDRESSES")}
                      className="flex flex-col items-center p-2 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/30 transition-all cursor-pointer group/stat active:scale-95"
                    >
                      <span className="font-serif text-lg font-bold text-sky-500 group-hover/stat:text-sky-600 transition-colors">
                        {addresses.length}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Saved</span>
                    </button>
                  </div>
                </div>

                {/* 2. Curated iOS/Grab Styled Menu Groups */}
                <div className="space-y-4">
                  {/* GROUP 1: Activity & Orders */}
                  <div className="rounded-3xl bg-card border border-border/70 p-2 shadow-warm space-y-1">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Activities & Orders
                    </p>

                    <button 
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                        activeTab === "ORDERS" 
                          ? "text-primary bg-primary/10 font-semibold" 
                          : "hover:bg-secondary/60 text-foreground"
                      )}
                      onClick={() => setActiveTab("ORDERS")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <ShoppingBag className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm block">Order History</span>
                          <span className="text-xs text-muted-foreground">Track and re-order meals</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {orders.length > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                            {orders.length}
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </div>
                    </button>

                    <button 
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                        activeTab === "COUPONS" 
                          ? "text-primary bg-primary/10 font-semibold" 
                          : "hover:bg-secondary/60 text-foreground"
                      )}
                      onClick={() => setActiveTab("COUPONS")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <Ticket className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm block">My Coupons & Rewards</span>
                          <span className="text-xs text-muted-foreground">Save on your pizza orders</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {coupons.length > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            {coupons.length} Available
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </div>
                    </button>

                    <button 
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                        activeTab === "FAVORITES" 
                          ? "text-primary bg-primary/10 font-semibold" 
                          : "hover:bg-secondary/60 text-foreground"
                      )}
                      onClick={() => setActiveTab("FAVORITES")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 shadow-2xs">
                          <Heart className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm block">Favorite Pizzas</span>
                          <span className="text-xs text-muted-foreground">Your most loved dishes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {favorites.length > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500">
                            {favorites.length}
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </div>
                    </button>
                  </div>

                  {/* GROUP 2: Account & Settings */}
                  <div className="rounded-3xl bg-card border border-border/70 p-2 shadow-warm space-y-1">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Account & Details
                    </p>

                    <button 
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                        activeTab === "SETTINGS" 
                          ? "text-primary bg-primary/10 font-semibold" 
                          : "hover:bg-secondary/60 text-foreground"
                      )}
                      onClick={() => setActiveTab("SETTINGS")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <Settings className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm block">Profile Settings</span>
                          <span className="text-xs text-muted-foreground">Name, phone, avatar & password</span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60" />
                    </button>

                    <button 
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                        activeTab === "ADDRESSES" 
                          ? "text-primary bg-primary/10 font-semibold" 
                          : "hover:bg-secondary/60 text-foreground"
                      )}
                      onClick={() => setActiveTab("ADDRESSES")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <MapPin className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm block">Saved Addresses</span>
                          <span className="text-xs text-muted-foreground">Delivery drop-off locations</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {addresses.length > 0 && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {addresses.length} saved
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </div>
                    </button>
                  </div>

                  {/* GROUP 3: Preferences & Actions */}
                  <div className="rounded-3xl bg-card border border-border/70 p-2 shadow-warm space-y-1">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Preferences
                    </p>

                    {/* Dark/Light Theme Toggle Switch Row */}
                    <div className="w-full flex items-center justify-between p-3 rounded-2xl text-sm">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                          {theme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm block">Appearance</span>
                          <span className="text-xs text-muted-foreground">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-8 px-3.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border/60 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        {theme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                        <span>{theme === "dark" ? "Dark" : "Light"}</span>
                      </button>
                    </div>

                    <div className="pt-1">
                      <button 
                        type="button"
                        className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0 shadow-2xs">
                            <LogOut className="size-5" />
                          </div>
                          <div className="text-left">
                            <span className="font-semibold text-destructive text-sm block">Sign Out</span>
                            <span className="text-xs text-destructive/70">Log out from this device</span>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-destructive/40" />
                      </button>
                    </div>
                  </div>
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
                <div className="lg:hidden mb-4">
                  <button 
                    type="button"
                    onClick={() => { navigate("/profile"); setActiveTab("MENU"); }} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 hover:bg-secondary border border-border/60 text-sm font-semibold text-foreground transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="size-4" />
                    Back to Profile
                  </button>
                </div>

                {displayTab === "SETTINGS" && (
                  <>
                    <div className="mb-6">
                      <h3 className="font-serif text-3xl font-bold text-foreground">Profile Settings</h3>
                      <p className="text-sm text-muted-foreground mt-1">Manage your account credentials, avatar, and personal details</p>
                    </div>

                    <div className="space-y-6">
                      {/* Card 1: Profile Information */}
                      <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-warm">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                          {/* Sleek Single Circular Avatar Upload */}
                          <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-border/60">
                            <div className="relative size-28 sm:size-32 group mb-3">
                              <div className="size-full rounded-full ring-4 ring-primary/30 p-1 bg-background shadow-lg overflow-hidden">
                                <div className="size-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center relative">
                                  {settingsForm.avatar ? (
                                    <img src={settingsForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="size-14 text-primary" />
                                  )}
                                  {isUploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                      <Loader2 className="size-6 animate-spin text-primary" />
                                      <span className="text-[10px] mt-1 font-semibold">Uploading...</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <label className="absolute bottom-0 right-0 size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background hover:scale-110 active:scale-95 transition-all cursor-pointer">
                                <Camera className="size-4.5" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleAvatarFileChange} 
                                  disabled={isUploadingAvatar}
                                />
                              </label>
                            </div>
                            <label className="text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                              <Camera className="size-3.5" /> Tap to change profile photo
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleAvatarFileChange} 
                                disabled={isUploadingAvatar}
                              />
                            </label>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <User className="size-4 text-primary" /> Full Name
                              </label>
                              <Input 
                                required 
                                value={settingsForm.name} 
                                onChange={e => setSettingsForm(prev => ({...prev, name: e.target.value}))} 
                                className="rounded-xl border-border/70 bg-background/50 h-12 text-sm font-medium focus-visible:ring-primary/30" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Phone className="size-4 text-primary" /> Phone Number
                              </label>
                              <Input 
                                required 
                                value={settingsForm.phone} 
                                onChange={e => setSettingsForm(prev => ({...prev, phone: e.target.value}))} 
                                className="rounded-xl border-border/70 bg-background/50 h-12 text-sm font-medium focus-visible:ring-primary/30" 
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Mail className="size-4 text-primary" /> Email Address <span className="text-xs text-muted-foreground font-normal">(Locked)</span>
                              </label>
                              <Input 
                                type="email" 
                                value={settingsForm.email} 
                                readOnly
                                disabled
                                autoComplete="off"
                                className="rounded-xl border-border/60 bg-secondary/80 h-12 cursor-not-allowed opacity-80 text-sm" 
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button 
                              type="submit" 
                              size="lg" 
                              className="rounded-full px-8 font-semibold shadow-warm hover:shadow-warm-lg"
                              disabled={isUpdatingSettings}
                            >
                              {isUpdatingSettings ? "Saving..." : "Save Profile Info"}
                            </Button>
                          </div>
                        </form>
                      </div>

                      {/* Card 2: Security & Password Update */}
                      <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8">
                        <h4 className="font-serif text-2xl font-bold text-foreground mb-2">Security</h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          Update your login password. Leaving these fields blank keeps your current password unchanged.
                        </p>
                        <form onSubmit={handleUpdateSecurity} className="space-y-6" autoComplete="off">
                          <div className="space-y-4 max-w-md animate-fade-in">
                            {hasPassword && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <Lock className="size-4" /> Current Password
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleSendForgotOTP}
                                    disabled={isSendingOTP}
                                    className="text-xs font-semibold text-primary hover:underline"
                                  >
                                    {isSendingOTP ? "Sending OTP..." : "Forgot Password?"}
                                  </button>
                                </div>
                                <div className="relative">
                                  <Input 
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={settingsForm.oldPassword} 
                                    onChange={e => setSettingsForm(prev => ({...prev, oldPassword: e.target.value}))} 
                                    className="rounded-xl border-border/60 bg-background/50 h-12 pr-10" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Lock className="size-4" /> {hasPassword ? "New Password" : "Create Password"}
                              </label>
                              <div className="relative">
                                <Input 
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  autoComplete="new-password"
                                  value={settingsForm.password} 
                                  onChange={e => setSettingsForm(prev => ({...prev, password: e.target.value}))} 
                                  className="rounded-xl border-border/60 bg-background/50 h-12 pr-10" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                              </div>

                              {settingsForm.password && (
                                <div className="p-3 bg-secondary/40 rounded-xl space-y-1.5 mt-2 text-xs border border-border/40">
                                  <p className="font-semibold text-muted-foreground">Password requirements:</p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div className="flex items-center gap-1">
                                      {settingsForm.password.length >= 8 ? <Check className="size-3.5 text-green-500" /> : <X className="size-3.5 text-red-400" />}
                                      <span className={settingsForm.password.length >= 8 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>8+ characters</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {/[A-Z]/.test(settingsForm.password) ? <Check className="size-3.5 text-green-500" /> : <X className="size-3.5 text-red-400" />}
                                      <span className={/[A-Z]/.test(settingsForm.password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>Uppercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {/[a-z]/.test(settingsForm.password) ? <Check className="size-3.5 text-green-500" /> : <X className="size-3.5 text-red-400" />}
                                      <span className={/[a-z]/.test(settingsForm.password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>Lowercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {/[0-9]/.test(settingsForm.password) ? <Check className="size-3.5 text-green-500" /> : <X className="size-3.5 text-red-400" />}
                                      <span className={/[0-9]/.test(settingsForm.password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>At least one number</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {settingsForm.password && (
                              <div className="space-y-2 animate-card-fade-in">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                  <Lock className="size-4" /> Confirm New Password
                                </label>
                                <div className="relative">
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={settingsForm.confirmPassword} 
                                    onChange={e => setSettingsForm(prev => ({...prev, confirmPassword: e.target.value}))} 
                                    className="rounded-xl border-border/60 bg-background/50 h-12 pr-10" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end pt-4">
                            <Button 
                              type="submit" 
                              size="lg" 
                              className="rounded-full px-8"
                              disabled={isUpdatingSettings || (settingsForm.password && (settingsForm.password !== settingsForm.confirmPassword || settingsForm.password.length < 8))}
                            >
                              {isUpdatingSettings ? "Saving..." : "Update Password"}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Reset Password via OTP Dialog Overlay */}
                    <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
                      <DialogContent className="sm:max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-warm-lg">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl font-bold">Bypass Password via OTP</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            We have sent a 6-digit OTP code to your email <strong>{settingsForm.email}</strong>. Enter it below to authorize setting a new password.
                          </p>
                          <div className="space-y-2">
                            <Input 
                              type="text"
                              placeholder="000000"
                              maxLength={6}
                              value={otpCode}
                              onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              className="rounded-xl border-border/60 bg-background/50 h-14 text-center font-mono tracking-[0.5em] text-2xl"
                            />
                          </div>
                          <div className="flex gap-3 justify-end pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowOTPDialog(false)}
                              className="rounded-full px-5"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleVerifyForgotOTP}
                              disabled={isVerifyingOTP}
                              className="rounded-full px-6"
                            >
                              {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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

                        <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-border/60 gap-3">
                          <span className="font-bold text-primary">${order.total}</span>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-full text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(order.id);
                              }}
                            >
                              <RefreshCcw className="size-3 mr-1 sm:mr-1.5" /> Reorder
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderDetails(order);
                              }}
                            >
                              Details <ChevronRight className="size-3 ml-0.5 sm:ml-1" />
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="rounded-full text-[11px] sm:text-xs h-7 sm:h-8 px-3 sm:px-4 ml-1 sm:ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/track/${order.id}`);
                              }}
                            >
                              Track
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
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                      <div>
                        <h3 className="font-serif text-3xl font-bold text-foreground">Saved Addresses</h3>
                        <p className="text-sm text-muted-foreground mt-1">Manage your delivery locations & fast checkout pins</p>
                      </div>
                      <Button 
                        onClick={() => setShowAddForm(!showAddForm)} 
                        className="rounded-full px-5 font-semibold shadow-warm hover:shadow-warm-lg"
                      >
                        <Plus className="size-4 mr-1.5" /> Add New
                      </Button>
                    </div>

                    {showAddForm && (
                      <form onSubmit={handleCreateAddress} className="bg-card border border-border/70 rounded-3xl p-6 mb-6 shadow-warm space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                          <h4 className="font-semibold text-foreground text-base">New Address Location</h4>
                          <button 
                            type="button" 
                            onClick={() => setShowAddForm(false)} 
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Close
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1 block">Address Label</label>
                            <Input 
                              required 
                              value={newAddress.label} 
                              onChange={e => setNewAddress(prev => ({...prev, label: e.target.value}))} 
                              placeholder="e.g. Home, Office, Condo" 
                              className="rounded-xl border-border/70 bg-background/50 h-11" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1 block">City / Province</label>
                            <select 
                              required 
                              value={newAddress.city} 
                              onChange={e => setNewAddress(prev => ({...prev, city: e.target.value}))} 
                              className="w-full h-11 px-3 rounded-xl border border-border/70 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="" disabled>Select a city</option>
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
                            <label className="text-xs font-semibold text-foreground">Specific Street Address</label>
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                                onClick={() => setShowMap(true)}
                              >
                                <MapPin className="size-3 mr-1" />
                                Map Pin
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                                onClick={handleAutoLocation}
                                disabled={isLocating}
                              >
                                <LocateFixed className={cn("size-3 mr-1", isLocating && "animate-spin")} />
                                {isLocating ? "Locating..." : "Use GPS"}
                              </Button>
                            </div>
                          </div>
                          <Input 
                            required 
                            value={newAddress.address_line} 
                            onChange={e => setNewAddress(prev => ({...prev, address_line: e.target.value}))} 
                            placeholder="e.g. St 271, House 123, Toul Kork" 
                            className="rounded-xl border-border/70 bg-background/50 h-11" 
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => setShowAddForm(false)}>Cancel</Button>
                          <Button type="submit" className="rounded-full px-6 font-semibold shadow-warm">Save Address</Button>
                        </div>
                      </form>
                    )}

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="bg-card border border-border/70 rounded-3xl p-12 text-center text-muted-foreground shadow-warm">
                        <MapPin className="size-16 mx-auto mb-4 opacity-20" />
                        <p className="font-semibold text-foreground">No saved addresses yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Add your home or office address for 1-tap checkout!</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {addresses.map(addr => {
                          const isHome = (addr.label || "").toLowerCase().includes("home") || (addr.label || "").toLowerCase().includes("ផ្ទះ");
                          const isWork = (addr.label || "").toLowerCase().includes("work") || (addr.label || "").toLowerCase().includes("office") || (addr.label || "").toLowerCase().includes("ការងារ");

                          return (
                            <div 
                              key={addr.id} 
                              className={cn(
                                "bg-card border rounded-3xl p-5 relative group flex flex-col justify-between transition-all hover:shadow-warm",
                                addr.is_default ? "border-primary/40 shadow-xs" : "border-border/70"
                              )}
                            >
                              {/* Top Bar: Icon + Label + Default Badge */}
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs",
                                      addr.is_default ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                                    )}>
                                      {isHome ? <MapPin className="size-5" /> : isWork ? <Building2 className="size-5" /> : <MapPin className="size-5" />}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-foreground text-base leading-tight">
                                        {addr.label || "Delivery"}
                                      </h4>
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {addr.city || "Phnom Penh"}
                                      </span>
                                    </div>
                                  </div>

                                  {addr.is_default ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-primary/15 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/25">
                                      <Star className="size-3 fill-primary" /> Default
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetDefaultAddress(addr.id)}
                                      className="text-[11px] text-muted-foreground hover:text-primary font-semibold transition-colors cursor-pointer"
                                      title="Set as Default Address"
                                    >
                                      Set Default
                                    </button>
                                  )}
                                </div>

                                {/* Short & Concise Address Line (Max 2 lines) */}
                                <p className="text-xs text-foreground/80 font-medium line-clamp-2 mt-1.5 leading-relaxed bg-secondary/30 rounded-xl p-2.5 border border-border/30">
                                  {addr.address_line}
                                </p>
                              </div>

                              {/* Bottom Action Bar: View Detail, Edit, Delete */}
                              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedAddressDetails(addr)}
                                  className="h-8 px-3 rounded-full text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="size-3.5 text-primary" />
                                  <span>Details</span>
                                </Button>

                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingAddress(addr)}
                                    className="size-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                                    title="Edit Address"
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="size-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                    title="Delete Address"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* View Address Detail Modal */}
                    <Dialog open={Boolean(selectedAddressDetails)} onOpenChange={(open) => !open && setSelectedAddressDetails(null)}>
                      <DialogContent className="sm:max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-warm-lg">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2">
                            <MapPin className="size-5 text-primary" />
                            {selectedAddressDetails?.label || "Address Details"}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedAddressDetails && (
                          <div className="space-y-4 py-3">
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-2">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">City / Province</span>
                                <span className="text-sm font-semibold text-foreground">{selectedAddressDetails.city || "Phnom Penh"}</span>
                              </div>
                              <div className="pt-2 border-t border-border/40">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Full Address Details</span>
                                <p className="text-sm font-medium text-foreground leading-relaxed mt-0.5">{selectedAddressDetails.address_line}</p>
                              </div>
                              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</span>
                                {selectedAddressDetails.is_default ? (
                                  <span className="inline-flex items-center gap-1 text-xs bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">
                                    <Star className="size-3 fill-primary" /> Default
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground font-medium">Standard</span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                              {!selectedAddressDetails.is_default && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    handleSetDefaultAddress(selectedAddressDetails.id);
                                    setSelectedAddressDetails(null);
                                  }}
                                  className="rounded-full px-4 text-xs font-semibold"
                                >
                                  <Star className="size-3.5 mr-1" /> Set Default
                                </Button>
                              )}
                              <Button
                                type="button"
                                onClick={() => {
                                  setEditingAddress(selectedAddressDetails);
                                  setSelectedAddressDetails(null);
                                }}
                                className="rounded-full px-5 font-semibold shadow-warm"
                              >
                                <Pencil className="size-3.5 mr-1" /> Edit
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Edit Address Modal */}
                    <Dialog open={Boolean(editingAddress)} onOpenChange={(open) => !open && setEditingAddress(null)}>
                      <DialogContent className="sm:max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-warm-lg">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2">
                            <Pencil className="size-5 text-primary" />
                            Edit Address
                          </DialogTitle>
                        </DialogHeader>
                        {editingAddress && (
                          <form onSubmit={handleUpdateAddress} className="space-y-4 py-3">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">Address Label</label>
                                <Input 
                                  required 
                                  value={editingAddress.label || ""} 
                                  onChange={e => setEditingAddress(prev => ({ ...prev, label: e.target.value }))} 
                                  className="rounded-xl border-border/70 bg-background/50 h-11"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">City / Province</label>
                                <select 
                                  required 
                                  value={editingAddress.city || ""} 
                                  onChange={e => setEditingAddress(prev => ({ ...prev, city: e.target.value }))} 
                                  className="w-full h-11 px-3 rounded-xl border border-border/70 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option value="Phnom Penh">Phnom Penh</option>
                                  <option value="Kandal">Kandal</option>
                                  <option value="Siem Reap">Siem Reap</option>
                                  <option value="Sihanoukville">Sihanoukville</option>
                                  <option value="Battambang">Battambang</option>
                                  <option value="Kampong Cham">Kampong Cham</option>
                                </select>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-semibold text-foreground">Specific Street Address</label>
                                  <div className="flex gap-2">
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full cursor-pointer"
                                      onClick={() => setShowMap(true)}
                                    >
                                      <MapPin className="size-3 mr-1" />
                                      Map Pin
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full cursor-pointer"
                                      onClick={handleAutoLocation}
                                      disabled={isLocating}
                                    >
                                      <LocateFixed className={cn("size-3 mr-1", isLocating && "animate-spin")} />
                                      {isLocating ? "Locating..." : "Use GPS"}
                                    </Button>
                                  </div>
                                </div>
                                <Input 
                                  required 
                                  value={editingAddress.address_line || ""} 
                                  onChange={e => setEditingAddress(prev => ({ ...prev, address_line: e.target.value }))} 
                                  className="rounded-xl border-border/70 bg-background/50 h-11"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                              <Button type="button" variant="outline" className="rounded-full px-4" onClick={() => setEditingAddress(null)}>
                                Cancel
                              </Button>
                              <Button type="submit" className="rounded-full px-6 font-semibold shadow-warm">
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
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
                              <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
        <DialogContent className="sm:max-w-md bg-background border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Order #{selectedOrderDetails?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 mt-4">
            {selectedOrderDetails && allOrderItems
              .filter(item => String(item.order_id) === String(selectedOrderDetails.id))
              .map(item => {
                const foodItem = allProducts.find(f => String(f.id) === String(item.product_id) || f.name === item.product_name) || {};
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm gap-3 p-3 bg-secondary/30 rounded-xl border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="size-12 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border/50 flex items-center justify-center">
                        {foodItem.image ? (
                          <img src={foodItem.image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="size-5 text-primary/60" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {item.quantity}x {item.product_name}
                        </span>
                        {item.options && (
                          <span className="text-xs text-muted-foreground">
                            {(() => {
                              try {
                                return Object.values(JSON.parse(item.options)).join(", ");
                              } catch(e) {
                                return String(item.options);
                              }
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold">${Number(item.line_total).toFixed(2)}</span>
                  </div>
                );
              })}
            {selectedOrderDetails && allOrderItems.filter(item => String(item.order_id) === String(selectedOrderDetails.id)).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">No items found for this order.</div>
            )}
          </div>
          <div className="pt-4 border-t border-border/60 space-y-2 text-sm mt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${Number(selectedOrderDetails?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>${Number(selectedOrderDetails?.delivery_fee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground text-base pt-2">
              <span>Total</span>
              <span className="text-primary">${Number(selectedOrderDetails?.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">Pick Location</h3>
              <MapPicker
                onConfirm={(loc) => {
                  if (editingAddress) {
                    setEditingAddress(prev => ({ ...prev, address_line: loc.address, city: loc.city || prev?.city }));
                  } else {
                    setNewAddress(prev => ({ ...prev, address_line: loc.address, city: loc.city || prev?.city }));
                  }
                  setShowMap(false);
                  toast.success("Location picked successfully!");
                }}
                onClose={() => setShowMap(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>
      <CartDrawer />
    </div>
  );
}
