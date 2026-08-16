import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner.jsx";
import { ScrollToTop } from "@/components/shared/scroll-to-top.jsx";
import { ActiveOrderWidget } from "@/components/food/active-order-widget.jsx";
import { FlyToCart } from "@/components/shared/fly-to-cart.jsx";

const Home = lazy(() => import("./pages/home.jsx"));
const MenuPage = lazy(() => import("./pages/menu.jsx"));
const ProductDetailPage = lazy(() => import("./pages/product-detail.jsx"));
const CartPage = lazy(() => import("./pages/cart.jsx"));
const CheckoutPage = lazy(() => import("./pages/checkout.jsx"));
const PaymentGatewayPage = lazy(() => import("./pages/payment.jsx"));
const OrderConfirmationPage = lazy(() => import("./pages/order-confirmation.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/layout.jsx"));
const AdminLoginPage = lazy(() => import("./pages/admin/login.jsx"));
const LeaveReviewPage = lazy(() => import("./pages/leave-review.jsx"));
const LoginPage = lazy(() => import("./pages/login.jsx"));
const OrderTrackingPage = lazy(() => import("./pages/order-tracking.jsx"));
const DriverLoginPage = lazy(() => import("./pages/driver/login.jsx"));
const DriverDashboardPage = lazy(() => import("./pages/driver/dashboard.jsx"));
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

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Toaster position="bottom-left" richColors closeButton offset="24px" />
      <ActiveOrderWidget />
      <FlyToCart />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/:orderId" element={<PaymentGatewayPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/track/:orderId" element={<OrderTrackingPage />} />
          <Route path="/review/:productId" element={<LeaveReviewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/driver/login" element={<DriverLoginPage />} />
          <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
