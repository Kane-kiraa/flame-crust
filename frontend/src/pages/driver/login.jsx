import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, KeyRound, Loader2, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { create, list } from "@/lib/api";

export default function DriverLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      // Check if driver exists
      const drivers = await list("drivers");
      const found = drivers.find(d => d.phone === phone);
      
      if (!found) {
        toast.error("This number is not registered as a Driver.");
        setLoading(false);
        return;
      }

      await create("otps", {
        target: phone,
        otp_code: Math.floor(100000 + Math.random() * 900000).toString(),
        is_used: false,
        expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
      });
      toast.success("OTP sent to " + phone);
      setStep("OTP");
    } catch (err) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    
    try {
      const drivers = await list("drivers");
      const found = drivers.find(d => d.phone === phone);
      if (found) {
        localStorage.setItem("driverAuth", JSON.stringify({ id: found.id, name: found.name, phone: found.phone, authenticated: true }));
        toast.success(`Welcome back, ${found.name}!`);
        navigate("/driver/dashboard");
      } else {
        toast.error("Driver not found.");
      }
    } catch (err) {
      toast.error("Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Bike className="size-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-center text-white mb-2">
          Driver Portal
        </h1>
        <p className="text-center text-zinc-400 mb-8 text-sm">
          {step === "PHONE" ? "Enter your registered phone number" : `Enter the 6-digit code sent to ${phone}`}
        </p>

        {step === "PHONE" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 012 345 678"
                className="pl-12 h-14 rounded-2xl text-lg bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transition-all"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "Send Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="pl-12 h-14 rounded-2xl text-2xl tracking-[0.5em] font-mono text-center bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transition-all"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "Verify & Sign In"}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep("PHONE")}
              className="w-full text-center text-sm font-medium text-zinc-500 hover:text-white mt-4"
            >
              Change phone number
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
