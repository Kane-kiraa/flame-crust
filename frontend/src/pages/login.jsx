import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, ArrowRight, Loader2, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { PageTransition } from "@/components/shared/page-transition";
import { toast } from "sonner";
import { create, list } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState("PHONE"); // PHONE or EMAIL
  const [step, setStep] = useState("INPUT"); // INPUT or OTP
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Pre-fetch customers to simulate backend login
    list("customers").then(setCustomers).catch(() => {});
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
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
    setTimeout(() => {
      let customer = customers.find(c => c.phone === phone);
      if (!customer) {
        // Mock a newly created customer ID for them
        customer = { id: 999, phone, name: "New User", role: "CUSTOMER" };
      }
      localStorage.setItem("customerAuth", JSON.stringify({ ...customer, authenticated: true }));
      toast.success("Successfully logged in!");
      navigate("/");
    }, 1000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const customer = customers.find(c => c.email === email && c.password_hash === password);
      setLoading(false);
      
      if (customer) {
        localStorage.setItem("customerAuth", JSON.stringify({ ...customer, authenticated: true }));
        toast.success("Welcome back, " + customer.name + "!");
        navigate("/");
      } else {
        toast.error("Invalid email or password.");
      }
    }, 800);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Fetch user info from Google API using access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        
        let customer = customers.find(c => c.email === userInfo.email);
        if (!customer) {
          // If new, create customer logic (mocked)
          customer = { id: Math.floor(Math.random() * 10000), email: userInfo.email, name: userInfo.name, role: "CUSTOMER" };
        }
        
        localStorage.setItem("customerAuth", JSON.stringify({ ...customer, avatar: userInfo.picture, authenticated: true }));
        toast.success("Welcome, " + userInfo.name + "!");
        navigate("/");
      } catch (err) {
        toast.error("Failed to authenticate with Google.");
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed or was cancelled.");
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32 flex items-center justify-center">
        <PageTransition>
          <div className="w-full max-w-md px-4 py-8 mx-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border border-border/60 bg-card p-8 shadow-warm-lg"
            >
              <h1 className="font-serif text-3xl font-bold text-center text-foreground mb-2">
                {step === "INPUT" ? "Welcome back" : "Verify your number"}
              </h1>
              <p className="text-center text-muted-foreground mb-6">
                {step === "INPUT" 
                  ? "Sign in or create an account to continue."
                  : `We've sent a 6-digit code to ${phone}.`}
              </p>

              {step === "INPUT" ? (
                <>
                  <div className="flex p-1 bg-secondary rounded-2xl mb-8">
                    <button
                      onClick={() => setAuthMethod("PHONE")}
                      className={cn(
                        "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
                        authMethod === "PHONE" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Phone Number
                    </button>
                    <button
                      onClick={() => setAuthMethod("EMAIL")}
                      className={cn(
                        "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
                        authMethod === "EMAIL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Email Address
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {authMethod === "PHONE" ? (
                      <motion.form 
                        key="phone"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        onSubmit={handleSendOTP} className="space-y-4"
                      >
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 012 345 678"
                            className="pl-12 h-14 rounded-2xl text-lg"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transition-all"
                        >
                          {loading ? <Loader2 className="size-5 animate-spin" /> : "Continue with Phone"}
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form 
                        key="email"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        onSubmit={handleEmailLogin} className="space-y-4"
                      >
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="pl-12 h-14 rounded-2xl text-base"
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="pl-12 h-14 rounded-2xl text-base"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transition-all"
                        >
                          {loading ? <Loader2 className="size-5 animate-spin" /> : "Sign in with Email"}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                      <Button 
                        variant="outline" 
                        type="button"
                        disabled={loading}
                        onClick={() => handleGoogleLogin()}
                        className="h-14 rounded-2xl bg-background hover:bg-secondary border-border/60 font-semibold text-foreground transition-all"
                      >
                        <svg className="size-5 mr-2" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleVerifyOTP} className="space-y-4"
                >
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="pl-12 h-14 rounded-2xl text-2xl tracking-[0.5em] font-mono text-center"
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
                    onClick={() => { setStep("INPUT"); setOtp(""); }}
                    className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground mt-4"
                  >
                    Go back
                  </button>
                </motion.form>
              )}
            </motion.div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
