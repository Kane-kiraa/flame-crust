import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2, KeyRound, Lock, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { PageTransition } from "@/components/shared/page-transition";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect URL from query params (?redirect=...)
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect");

  const [authMethod, setAuthMethod] = useState("PASSWORD"); // PASSWORD or OTP
  const [step, setStep] = useState("INPUT"); // INPUT or OTP_VERIFY
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpLockTime, setOtpLockTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Check if OTP rate limit is active
    const lockedUntil = localStorage.getItem("otpLockTime");
    if (lockedUntil && new Date().getTime() < parseInt(lockedUntil)) {
      setOtpLockTime(parseInt(lockedUntil));
    }
  }, []);

  useEffect(() => {
    if (!otpLockTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (now >= otpLockTime) {
        setOtpLockTime(null);
        localStorage.removeItem("otpLockTime");
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.ceil((otpLockTime - now) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpLockTime]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);

    try {
      // 1. Call unified login endpoint
      let response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      // Fallback for older backend endpoints if unified route was unavailable
      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_URL}/auth/admin-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (!response.ok) {
          response = await fetch(`${API_URL}/auth/customer-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), password }),
          });
        }
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Invalid email or password");
      }

      const data = await response.json();
      const isAdmin = data.type === "ADMIN";

      if (isAdmin) {
        const user = data.user || data;
        const seedName = user.name || email.split("@")[0] || "Admin";
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seedName}&backgroundColor=f97316&textColor=ffffff`;

        localStorage.setItem(
          "adminAuth",
          JSON.stringify({
            ...user,
            avatar: avatarUrl,
            token: data.token,
            authenticated: true,
          })
        );

        localStorage.setItem(
          "customerAuth",
          JSON.stringify({
            id: user.id,
            name: user.name || seedName,
            email: user.email || email,
            role: user.role || "ADMIN",
            avatar: avatarUrl,
            token: data.token,
            authenticated: true,
          })
        );

        window.dispatchEvent(new Event("authChanged"));
        toast.success(`Welcome to Flame & Crust Admin, ${user.name || "Admin"}!`);

        const destination = redirectPath && redirectPath.startsWith("/admin") 
          ? redirectPath 
          : "/admin/dashboard";
        navigate(destination, { replace: true });
      } else if (data.type === "DRIVER") {
        const driver = data.driver || data;
        localStorage.setItem(
          "driverAuth",
          JSON.stringify({
            ...driver,
            token: data.token,
            authenticated: true,
          })
        );
        window.dispatchEvent(new Event("authChanged"));
        toast.success(`Welcome back, ${driver.name}!`);
        
        navigate("/driver/dashboard", { replace: true });
      } else if (data.type === "KITCHEN_STAFF") {
        const staff = data.user || data;
        localStorage.setItem(
          "kitchenAuth",
          JSON.stringify({
            ...staff,
            token: data.token,
            authenticated: true,
          })
        );
        window.dispatchEvent(new Event("authChanged"));
        toast.success(`Welcome to the Kitchen, ${staff.name}!`);
        
        navigate("/kitchen/dashboard", { replace: true });
      } else {
        const customer = data.customer || data;
        const seedName = customer.name || email.split("@")[0] || "User";
        const avatarUrl = customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${seedName}&backgroundColor=e2e8f0&textColor=475569`;

        localStorage.removeItem("adminAuth");
        localStorage.setItem(
          "customerAuth",
          JSON.stringify({
            ...customer,
            avatar: avatarUrl,
            token: data.token,
            authenticated: true,
          })
        );

        window.dispatchEvent(new Event("authChanged"));
        toast.success(`Welcome back, ${customer.name || seedName}!`);

        const destination = redirectPath && !redirectPath.startsWith("/admin") 
          ? redirectPath 
          : "/";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();

    if (otpLockTime) {
      toast.error(`Please wait ${Math.ceil(timeLeft / 60)} minutes before trying again.`);
      return;
    }

    if (!email || email.length < 5 || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 429 || (err.error && err.error.includes("Too many"))) {
          const lockUntil = new Date().getTime() + 10 * 60 * 1000;
          setOtpLockTime(lockUntil);
          localStorage.setItem("otpLockTime", lockUntil.toString());
        }
        throw new Error(err.error || "Failed to send OTP");
      }

      toast.success("OTP sent to " + email);
      setStep("OTP_VERIFY");
    } catch (err) {
      toast.error(err.message || "Failed to send OTP.");
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
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Invalid OTP");
      }

      const data = await response.json();
      const customer = data.customer;
      const seedName = customer.name || email.split("@")[0] || "User";
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seedName}&backgroundColor=e2e8f0&textColor=475569`;

      localStorage.removeItem("adminAuth");
      localStorage.setItem(
        "customerAuth",
        JSON.stringify({
          ...customer,
          avatar: avatarUrl,
          token: data.token,
          authenticated: true,
        })
      );
      window.dispatchEvent(new Event("authChanged"));
      toast.success(`Welcome, ${customer.name || seedName}!`);

      const destination = redirectPath && !redirectPath.startsWith("/admin") 
        ? redirectPath 
        : "/";
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        // Send Google user info to backend to create/fetch customer and get a real JWT
        const response = await fetch(`${API_URL}/auth/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: userInfo.email, 
            name: userInfo.name, 
            avatar: userInfo.picture 
          }),
        });
        
        if (!response.ok) {
           throw new Error("Failed to authenticate with backend.");
        }
        
        const data = await response.json();
        const customer = data.customer;

        localStorage.setItem(
          "customerAuth",
          JSON.stringify({ 
            ...customer, 
            avatar: data.avatar || userInfo.picture, 
            token: data.token,
            authenticated: true 
          })
        );
        window.dispatchEvent(new Event("authChanged"));
        toast.success("Welcome, " + (customer.name || userInfo.name) + "!");

        const destination = redirectPath && !redirectPath.startsWith("/admin") 
          ? redirectPath 
          : "/";
        navigate(destination, { replace: true });
      } catch (err) {
        toast.error("Failed to authenticate with Google.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed or was cancelled.");
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-32 pb-16 flex items-center justify-center px-4">
        <PageTransition>
          <div className="w-full max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-warm-xl relative overflow-hidden"
            >
              {/* Flame header accent */}
              <div className="flex justify-center mb-4">
                <div className="size-14 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="text-2xl select-none">🔥</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-center text-foreground mb-1">
                {step === "INPUT" ? "Welcome to Flame & Crust" : "Verify Email Code"}
              </h1>
              <p className="text-center text-muted-foreground text-sm mb-6">
                {step === "INPUT"
                  ? "Single sign-in for Customers, Staff & Admins"
                  : `Enter the 6-digit verification code sent to ${email}`}
              </p>

              {step === "INPUT" ? (
                <>
                  {/* Auth Mode Switcher */}
                  <div className="flex p-1 bg-secondary/80 rounded-2xl mb-6">
                    <button
                      type="button"
                      onClick={() => setAuthMethod("PASSWORD")}
                      className={cn(
                        "flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5",
                        authMethod === "PASSWORD"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Lock className="size-3.5" />
                      Email & Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod("OTP")}
                      className={cn(
                        "flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5",
                        authMethod === "OTP"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <KeyRound className="size-3.5" />
                      Email OTP
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {authMethod === "PASSWORD" ? (
                      <motion.form
                        key="password-form"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        onSubmit={handlePasswordLogin}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground/80 pl-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="pl-11 h-13 rounded-2xl bg-background border-border/80 text-sm focus-visible:ring-primary"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground/80 pl-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="pl-11 pr-11 h-13 rounded-2xl bg-background border-border/80 text-sm focus-visible:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setAuthMethod("OTP")}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Sign in with One-Time Code
                          </button>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-13 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-warm mt-2"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="size-4 animate-spin" />
                              Signing In...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Sign In <ArrowRight className="size-4" />
                            </span>
                          )}
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="otp-form"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        onSubmit={handleSendOTP}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground/80 pl-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="pl-11 h-13 rounded-2xl bg-background border-border/80 text-sm focus-visible:ring-primary"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground pl-1">
                          We will send a 6-digit verification code to your email to log you in instantly.
                        </p>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-13 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-warm mt-2"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="size-4 animate-spin" />
                              Sending Code...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Send One-Time Code <ArrowRight className="size-4" />
                            </span>
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Social login divider */}
                  <div className="mt-7 mb-5">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/70" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <Button
                        variant="outline"
                        type="button"
                        disabled={loading}
                        onClick={() => handleGoogleLogin()}
                        className="w-full h-13 rounded-2xl bg-background hover:bg-secondary/70 border-border/80 font-semibold text-foreground transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="size-5" viewBox="0 0 24 24">
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
                /* OTP Verification Step */
                <motion.form
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/80 block text-center">
                      6-Digit OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <Input
                        type="text"
                        maxLength={6}
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="pl-12 h-14 rounded-2xl text-2xl tracking-[0.4em] font-mono text-center bg-background border-border/80 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full h-13 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-warm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("INPUT");
                        setOtp("");
                      }}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      ← Back to login
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          </div>
        </PageTransition>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
