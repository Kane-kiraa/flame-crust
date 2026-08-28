import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Phone, ShieldCheck, Car, Calendar, Star, 
  CheckCircle, Package, Edit, Key, LogOut, Camera, Loader2, X, 
  Check, Eye, EyeOff, Bike, MapPin, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getDriverMe, updateDriverProfile, list } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme] = useState(localStorage.getItem("driverTheme") || "light");

  // Photo uploading state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    vehicle_info: "",
    license_plate: "",
    emergency_contact: "",
    address: "",
    national_id: "",
    date_of_birth: "",
  });

  // Change Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live Driver Orders & Stats
  const [stats, setStats] = useState({
    totalDeliveries: 42,
    completedDeliveries: 38,
    rating: 4.9,
    successRate: 95,
  });

  useEffect(() => {
    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = '#09090b';
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = '#f8fafc';
    }
    
    const auth = localStorage.getItem("driverAuth");
    if (!auth) {
      navigate("/login");
      return;
    }
    
    getDriverMe().then(freshDriver => {
      setDriver(freshDriver);
      setEditForm({
        name: freshDriver.name || "",
        phone: freshDriver.phone || "",
        vehicle_info: freshDriver.vehicle_info || "",
        license_plate: freshDriver.license_plate || "",
        emergency_contact: freshDriver.emergency_contact || "",
        address: freshDriver.address || "",
        national_id: freshDriver.national_id || "",
        date_of_birth: freshDriver.date_of_birth ? freshDriver.date_of_birth.split("T")[0] : "",
      });
      setLoading(false);

      // Load driver deliveries stats
      list("orders").then(orders => {
        const myOrders = orders.filter(o => String(o.driver_id) === String(freshDriver.id));
        if (myOrders.length > 0) {
          const completed = myOrders.filter(o => o.status === "DELIVERED").length;
          const rate = Math.round((completed / myOrders.length) * 100);
          setStats({
            totalDeliveries: myOrders.length,
            completedDeliveries: completed,
            rating: 4.9,
            successRate: rate > 0 ? rate : 100,
          });
        }
      }).catch(() => {});

    }).catch(() => {
      localStorage.removeItem("driverAuth");
      navigate("/login");
    });

    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.classList.remove("dark");
    };
  }, [navigate, theme]);

  // ── Handle Change Profile Photo ──
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast.error("ទំហំរូបភាពត្រូវតូចជាង 8MB");
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("កំពុងផ្ទុករូបភាពឡើង...");

    try {
      const uploadedUrl = await uploadImageToCloudinary(file);
      if (!uploadedUrl) {
        throw new Error("មិនអាចផ្ទុករូបភាពឡើងបានទេ");
      }

      // Update backend
      const updated = await updateDriverProfile({ profile_photo: uploadedUrl });
      
      // Update local driver state & local storage
      const newDriver = { ...driver, ...updated, profile_photo: uploadedUrl };
      setDriver(newDriver);

      const auth = localStorage.getItem("driverAuth");
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          localStorage.setItem("driverAuth", JSON.stringify({ ...parsed, ...newDriver }));
        } catch (err) {}
      }

      window.dispatchEvent(new Event("authChanged"));
      toast.success("បានផ្លាស់ប្តូររូបថត Profile ជោគជ័យ! 🎉", { id: toastId });
    } catch (err) {
      toast.error(err.message || "បរាជ័យក្នុងការផ្លាស់ប្តូររូបភាព", { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Handle Edit Profile Submit ──
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះ");
      return;
    }
    if (!editForm.phone.trim()) {
      toast.error("សូមបញ្ចូលលេខទូរស័ព្ទ");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateDriverProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        vehicle_info: editForm.vehicle_info.trim(),
        license_plate: editForm.license_plate.trim(),
        emergency_contact: editForm.emergency_contact.trim(),
        address: editForm.address.trim(),
        national_id: editForm.national_id.trim(),
        date_of_birth: editForm.date_of_birth || null,
      });

      const newDriver = { ...driver, ...updated };
      setDriver(newDriver);

      const auth = localStorage.getItem("driverAuth");
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          localStorage.setItem("driverAuth", JSON.stringify({ ...parsed, ...newDriver }));
        } catch (err) {}
      }

      window.dispatchEvent(new Event("authChanged"));
      toast.success("បានកែប្រែព័ត៌មាន Profile ជោគជ័យ! ✅");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || "បរាជ័យក្នុងការរក្សាទុក");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Handle Change Password ──
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      toast.error("សូមបញ្ចូល Password ថ្មី");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password ទាំងពីរមិនដូចគ្នាទេ");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateDriverProfile({ password: passwordForm.newPassword });
      toast.success("បានផ្លាស់ប្តូរ Password ជោគជ័យ! 🔒");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error(err.message || "បរាជ័យក្នុងការផ្លាស់ប្តូរ Password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driverAuth");
    window.dispatchEvent(new Event("authChanged"));
    toast.success("បានចាកចេញពីគណនីជោគជ័យ");
    navigate("/login");
  };

  if (loading || !driver) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors">
        <div className="size-10 border-4 border-slate-200 dark:border-zinc-800 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans transition-colors selection:bg-amber-200 dark:selection:bg-amber-900/50 pb-20">
      
      {/* Hidden File Input for Avatar */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handlePhotoSelect} 
        className="hidden" 
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 pt-[env(safe-area-inset-top)] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            to="/driver/dashboard" 
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-600 dark:text-zinc-300 hover:text-primary transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="size-4 stroke-[2.5]" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 space-y-6">
        
        {/* Profile Hero Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 sm:p-8 border border-slate-200/70 dark:border-white/10 shadow-sm relative overflow-hidden transition-all">
          
          {/* Subtle Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
            
            {/* Avatar with Camera Trigger & Loading */}
            <div className="relative shrink-0 group">
              <div className="size-32 sm:size-36 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 ring-4 ring-red-500/30 shadow-md relative bg-slate-100 dark:bg-zinc-800">
                {driver.profile_photo ? (
                  <img 
                    src={driver.profile_photo} 
                    alt={driver.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-500">
                    <User className="size-16" />
                  </div>
                )}

                {/* Uploading Overlay */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <Loader2 className="size-7 animate-spin text-red-400" />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-wider">Uploading...</span>
                  </div>
                )}
              </div>

              {/* Camera Change Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-1 right-1 size-10 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 ring-3 ring-white dark:ring-zinc-900 active:scale-90 transition-all cursor-pointer"
                title="Change Profile Photo (ដូររូបភាព)"
              >
                <Camera className="size-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Driver Details Info */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight truncate">
                  {driver.name}
                </h1>
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 bg-red-500/15 text-red-600 dark:text-red-400 rounded-lg border border-red-500/30 w-fit mx-auto md:mx-0">
                  <Bike className="size-3 stroke-[2.5]" />
                  Driver Partner
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                Flame & Crust Fast Delivery
              </p>

              {/* ID & Joined Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                  <ShieldCheck className="size-4 text-red-500 stroke-[2.5]" />
                  ID: {driver.phone || "0888631805"}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                  <Calendar className="size-4 text-amber-500 stroke-[2.5]" />
                  Joined: {driver.created_at ? new Date(driver.created_at).toLocaleDateString("en-GB") : "22/08/2026"}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col items-center justify-center text-center transition-colors">
            <div className="size-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
              <Package className="size-5 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">{stats.totalDeliveries}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Deliveries</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col items-center justify-center text-center transition-colors">
            <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <CheckCircle className="size-5 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">{stats.completedDeliveries}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Completed</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col items-center justify-center text-center transition-colors">
            <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <Star className="size-5 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">{stats.rating}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Rating</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col items-center justify-center text-center transition-colors">
            <div className="size-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
              <ShieldCheck className="size-5 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">{stats.successRate}%</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Success Rate</p>
          </div>
        </div>

        {/* Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Personal Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <User className="size-4 text-red-500 stroke-[2.5]" />
                Personal Information
              </h2>
              <button 
                onClick={() => {
                  setEditForm({
                    name: driver.name || "",
                    phone: driver.phone || "",
                    vehicle_info: driver.vehicle_info || "",
                    license_plate: driver.license_plate || "",
                    emergency_contact: driver.emergency_contact || "",
                    address: driver.address || "",
                    national_id: driver.national_id || "",
                    date_of_birth: driver.date_of_birth ? driver.date_of_birth.split("T")[0] : "",
                  });
                  setIsEditModalOpen(true);
                }}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Edit className="size-3.5" /> Edit
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{driver.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1 truncate">
                    <Phone className="size-3.5 text-slate-400 shrink-0" />
                    {driver.phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {driver.email || "No email"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Emergency Contact</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {driver.emergency_contact || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Car className="size-4 text-red-500 stroke-[2.5]" />
                Vehicle & Registration
              </h2>
              <button 
                onClick={() => {
                  setEditForm({
                    name: driver.name || "",
                    phone: driver.phone || "",
                    vehicle_info: driver.vehicle_info || "",
                    license_plate: driver.license_plate || "",
                    emergency_contact: driver.emergency_contact || "",
                    address: driver.address || "",
                    national_id: driver.national_id || "",
                    date_of_birth: driver.date_of_birth ? driver.date_of_birth.split("T")[0] : "",
                  });
                  setIsEditModalOpen(true);
                }}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Edit className="size-3.5" /> Edit
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Vehicle Type</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {driver.vehicle_info || "Motorcycle (Honda Wave)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">License Plate</p>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md inline-block w-fit">
                    {driver.license_plate || "1A-2345"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Operating Area</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {driver.address || "Phnom Penh"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Status</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Verified Active
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Actions Buttons */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 sm:p-6 border border-slate-200/70 dark:border-white/10 shadow-xs transition-colors flex flex-col sm:flex-row items-center gap-3">
          <Button 
            className="w-full sm:flex-1 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/20 active:scale-98 transition-all border-none flex items-center justify-center gap-2"
            onClick={() => {
              setEditForm({
                name: driver.name || "",
                phone: driver.phone || "",
                vehicle_info: driver.vehicle_info || "",
                license_plate: driver.license_plate || "",
                emergency_contact: driver.emergency_contact || "",
                address: driver.address || "",
                national_id: driver.national_id || "",
                date_of_birth: driver.date_of_birth ? driver.date_of_birth.split("T")[0] : "",
              });
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="size-4 stroke-[2.5]" />
            Edit Profile
          </Button>
          
          <Button 
            variant="outline"
            className="w-full sm:flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 font-black text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Key className="size-4 stroke-[2.5]" />
            Change Password
          </Button>

          <Button 
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:flex-1 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-black text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="size-4 stroke-[2.5]" />
            Sign Out
          </Button>
        </div>

      </main>

      {/* ── MODAL: EDIT PROFILE ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Edit className="size-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight">
                    Edit Driver Profile
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                    Update your personal and vehicle details
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div>
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Full Name (ឈ្មោះពេញ) *
                </label>
                <Input 
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Phone Number (លេខទូរស័ព្ទ) *
                </label>
                <Input 
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 0888631805"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                    Vehicle Model (ម៉ូដែលម៉ូតូ)
                  </label>
                  <Input 
                    value={editForm.vehicle_info}
                    onChange={(e) => setEditForm(prev => ({ ...prev, vehicle_info: e.target.value }))}
                    placeholder="Honda Wave 125i"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                    License Plate (ផ្លាកលេខ)
                  </label>
                  <Input 
                    value={editForm.license_plate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, license_plate: e.target.value }))}
                    placeholder="1A-2345"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Emergency Contact (លេខទំនាក់ទំនងបន្ទាន់)
                </label>
                <Input 
                  value={editForm.emergency_contact}
                  onChange={(e) => setEditForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  placeholder="Family or friend phone"
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Operating Address / Area (តំបន់ដឹកជញ្ជូន)
                </label>
                <Input 
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Phnom Penh, Toul Kork, etc."
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-black text-xs uppercase"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase shadow-md shadow-red-600/20"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="size-4 stroke-[3] mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE PASSWORD ── */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Key className="size-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                    Set a new secure password
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="At least 6 characters"
                    required
                    className="h-11 rounded-xl pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    required
                    className="h-11 rounded-xl pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-black text-xs uppercase"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase shadow-md shadow-red-600/20"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="size-4 stroke-[3] mr-1.5" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
