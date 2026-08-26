import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner.jsx";
import { ScrollToTop } from "@/components/shared/scroll-to-top.jsx";
import { ActiveOrderWidget } from "@/components/food/active-order-widget.jsx";
import { FlyToCart } from "@/components/shared/fly-to-cart.jsx";
import { MobileBottomNav } from "@/components/food/mobile-bottom-nav.jsx";

const Home = lazy(() => import("./pages/home.jsx"));
const MenuPage = lazy(() => import("./pages/menu.jsx"));
const ProductDetailPage = lazy(() => import("./pages/product-detail.jsx"));
const CartPage = lazy(() => import("./pages/cart.jsx"));
const CheckoutPage = lazy(() => import("./pages/checkout.jsx"));
const PaymentGatewayPage = lazy(() => import("./pages/payment.jsx"));
const OrderConfirmationPage = lazy(() => import("./pages/order-confirmation.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/layout.jsx"));
const LeaveReviewPage = lazy(() => import("./pages/leave-review.jsx"));
const LoginPage = lazy(() => import("./pages/login.jsx"));
const OrderTrackingPage = lazy(() => import("./pages/order-tracking.jsx"));
const DriverLoginPage = lazy(() => import("./pages/driver/login.jsx"));
const DriverDashboardPage = lazy(() => import("./pages/driver/dashboard.jsx"));
const DriverProfilePage = lazy(() => import("./pages/driver/profile.jsx"));
const KitchenDashboardPage = lazy(() => import("./pages/kitchen/dashboard.jsx"));
const ProfilePage = lazy(() => import("./pages/profile.jsx"));

// Pre-fetch primary route chunks in background for instant smooth page transitions
import("./pages/home.jsx");
import("./pages/menu.jsx");
import("./pages/product-detail.jsx");
import("./pages/cart.jsx");
import("./pages/profile.jsx");

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const customerAuth = localStorage.getItem("customerAuth");
  const adminAuth = localStorage.getItem("adminAuth");
  const kitchenAuth = localStorage.getItem("kitchenAuth");
  const driverAuth = localStorage.getItem("driverAuth");
  const location = useLocation();
  
  if (!customerAuth && !adminAuth && !kitchenAuth && !driverAuth) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Toaster position="top-center" richColors closeButton offset="16px" />
      <ActiveOrderWidget />
      <FlyToCart />
      <MobileBottomNav />
      <Routes>
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/menu" element={<RequireAuth><MenuPage /></RequireAuth>} />
        <Route path="/product/:id" element={<RequireAuth><ProductDetailPage /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="/payment/:orderId" element={<PaymentGatewayPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/track/:orderId" element={<OrderTrackingPage />} />
        <Route path="/review/:productId" element={<RequireAuth><LeaveReviewPage /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/driver/login" element={<Navigate to="/login" replace />} />
        <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
        <Route path="/driver/profile" element={<DriverProfilePage />} />
        <Route path="/kitchen/login" element={<Navigate to="/login" replace />} />
        <Route path="/kitchen/dashboard" element={<KitchenDashboardPage />} />
      </Routes>
    </Suspense>
  );
}
