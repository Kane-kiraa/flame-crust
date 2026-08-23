import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ChefHat, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function KitchenLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("kitchenAuth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.token) {
          navigate("/kitchen/dashboard");
        }
      } catch {
        // Invalid auth, do nothing
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/kitchen-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Invalid credentials");
      }

      const data = await response.json();
      const user = data.user || data;

      localStorage.setItem(
        "kitchenAuth",
        JSON.stringify({
          ...user,
          token: data.token,
          authenticated: true,
        })
      );
      
      toast.success(`Welcome to the Kitchen, ${user.name || "Chef"}!`);
      navigate("/kitchen/dashboard", { replace: true });
      
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat className="size-8 text-white" />
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-center text-white mb-1">
          Flame & Crust Kitchen
        </h1>
        <p className="text-center text-zinc-500 text-sm mb-8">Staff Portal</p>

        {/* Login Form */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Staff Email"
                className="pl-12 h-16 rounded-2xl text-lg bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-orange-500"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-12 pr-12 h-16 rounded-2xl text-lg bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xl font-bold shadow-lg shadow-orange-500/20 transition-all mt-4"
            >
              {loading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Enter Kitchen <ArrowRight className="size-5" /></span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          © 2026 Flame & Crust Artisan Kitchen
        </p>
      </motion.div>
    </div>
  );
}
