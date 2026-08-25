import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, ShieldCheck, Car, Calendar, Star, CheckCircle, Package, Edit, Key, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDriverMe } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme] = useState(localStorage.getItem("driverTheme") || "light"); // Inherit theme, no toggle here

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
      setLoading(false);
    }).catch(() => {
      localStorage.removeItem("driverAuth");
      navigate("/login");
    });

    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.classList.remove("dark");
    };
  }, [navigate, theme]);

  const handleLogout = () => {
    localStorage.removeItem("driverAuth");
    navigate("/login");
  };

  if (loading || !driver) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors">
        <div className="size-10 border-4 border-slate-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans transition-colors selection:bg-blue-100 dark:selection:bg-blue-900/50 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 pt-[env(safe-area-inset-top)] transition-colors">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            to="/driver/dashboard" 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Profile Hero Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col md:flex-row items-center gap-8 transition-colors">
          <div className="relative shrink-0">
            {driver.profile_photo ? (
              <img src={driver.profile_photo} alt={driver.name} className="size-32 rounded-full object-cover border-4 border-slate-50 dark:border-zinc-950 shadow-sm" />
            ) : (
              <div className="size-32 rounded-full bg-slate-100 dark:bg-zinc-800 border-4 border-slate-50 dark:border-zinc-950 flex items-center justify-center shadow-sm">
                <User className="size-14 text-slate-400 dark:text-zinc-500" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 size-7 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-zinc-950 shadow-sm">
              <div className="size-3.5 rounded-full bg-green-500" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{driver.name}</h1>
            <p className="text-lg font-medium text-slate-500 dark:text-zinc-400 mt-1">Delivery Driver</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/5 transition-colors">
                <ShieldCheck className="size-4 text-slate-400 dark:text-zinc-500" />
                ID: {driver.phone || "N/A"}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/5 transition-colors">
                <Calendar className="size-4 text-slate-400 dark:text-zinc-500" />
                Joined: {new Date(driver.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
            <Package className="size-6 text-blue-500 mb-3" />
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100">42</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">Deliveries</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
            <CheckCircle className="size-6 text-green-500 mb-3" />
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100">38</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">Completed</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
            <Star className="size-6 text-orange-500 mb-3" />
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100">4.9</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">Rating</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
            <ShieldCheck className="size-6 text-purple-500 mb-3" />
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100">95%</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">Success Rate</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User className="size-4 text-slate-400 dark:text-zinc-500" />
              Personal Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100">{driver.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-slate-400" />
                    {driver.phone}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-slate-400" />
                    {driver.email || "No email"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Account Status</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-green-500" />
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Car className="size-4 text-slate-400 dark:text-zinc-500" />
              Vehicle Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Vehicle Type</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100">Motorcycle</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">License Plate</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100">1A-2345</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Vehicle Status</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-green-500" />
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm transition-colors mt-6 flex flex-col sm:flex-row items-center gap-4">
          <Button 
            className="w-full sm:flex-1 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 font-bold text-base transition-all"
            onClick={() => {}}
          >
            <Edit className="size-4 mr-2" />
            Edit Profile
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:flex-1 h-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-base transition-all"
            onClick={() => {}}
          >
            <Key className="size-4 mr-2" />
            Change Password
          </Button>
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:flex-1 h-12 rounded-xl bg-white dark:bg-zinc-900 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-base transition-all"
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>

      </main>
    </div>
  );
}
