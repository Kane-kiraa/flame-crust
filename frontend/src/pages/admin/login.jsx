import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    
    setLoading(true);
    // Simulate auth check (in a real app, this would be a POST to /auth/login)
    setTimeout(() => {
      localStorage.setItem("adminAuth", JSON.stringify({ email, role: "Admin", authenticated: true }));
      toast.success("Welcome to Flame & Crust Admin");
      navigate("/admin/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-card rounded-3xl border border-border/60 p-8 shadow-warm-lg"
      >
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔥</span>
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-center text-foreground mb-2">
          Admin Portal
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Sign in to manage Flame & Crust
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@flamecrust.com"
                className="pl-10 rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 rounded-xl bg-background"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
