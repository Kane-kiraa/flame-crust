"use client";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Minus,
  Star,
  Flame,
  Leaf,
  Check,
  ShoppingCart,
  Edit,
  User,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { CartDrawer } from "@/components/food/cart-drawer";
import { FoodCard } from "@/components/food/food-card";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { getImageUrl, getCachedFoodItems } from "@/lib/food-api";
import { useCart } from "@/lib/cart-store";
import { list, get, getProducts } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCart((s) => s.addItem);
  const removeItem = useCart((s) => s.removeItem);
  const lines = useCart((s) => s.lines);
  const isCartOpen = useCart((s) => s.isOpen);
  const inCart = lines.find((l) => l.id === id);

  const [product, setProduct] = useState(() => {
    const cached = getCachedFoodItems().find((p) => String(p.id) === String(id));
    return cached || null;
  });
  const [loading, setLoading] = useState(() => {
    return !getCachedFoodItems().some((p) => String(p.id) === String(id));
  });
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      try {
        const products = await getProducts();
        if (!isMounted) return;
        const prod = products.find(p => String(p.id) === String(id));
        if (!prod) throw new Error("Product not found");

        let allOptions = prod.options || [];
        let allVariants = [];
        allOptions.forEach(opt => {
          if (opt.variants) {
            allVariants = allVariants.concat(opt.variants);
          }
        });

        let allReviews = [];
        try {
          // Keep fetching reviews separately unless they are also mapped
          const res = await list("reviews");
          allReviews = res || [];
        } catch (e) {
          console.warn("Could not fetch reviews", e);
        }

        setProduct(prod);

        const prodOptions = allOptions;
        const prodVariants = allVariants.filter(v => v.active !== false);

        const defaults = {};
        prodOptions.forEach(opt => {
          const optVars = prodVariants.filter(v => String(v.option_id) === String(opt.id));
          if (optVars.length > 0) {
            defaults[opt.id] = optVars[0].id;
          }
        });

        setOptions(prodOptions);
        setVariants(prodVariants);
        setSelectedVariants(defaults);

        const productReviews = allReviews.filter(r => String(r.product_id) === String(id) && r.status === 'APPROVED');
        setReviews(productReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

        setLoading(false);
      } catch (err) {
        setError("Product not found");
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1) : "New";

  const selectedVariantDetails = {};
  if (product && options.length > 0) {
    Object.entries(selectedVariants).forEach(([optId, varId]) => {
      const opt = options.find(o => String(o.id) === String(optId));
      const v = variants.find(v => String(v.id) === String(varId));
      if (v && opt) selectedVariantDetails[opt.name] = v.name;
    });
  }

  const currentCartItemId = product && Object.keys(selectedVariantDetails).length > 0
    ? `${product.id}-${Object.values(selectedVariants).join('-')}`
    : product?.id;

  const currentVariantInCart = lines.find(l => String(l.id) === String(currentCartItemId));
  const variantQtyInCart = currentVariantInCart ? currentVariantInCart.qty : 0;
  const variantNameString = Object.values(selectedVariantDetails).join(', ');

  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQty(1);
    } else {
      setQty(Math.min(999, val));
    }
  };

  const handleAdd = (e) => {
    if (!product) return;

    if (e && e.preventDefault) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent("fly-to-cart", {
        detail: { image: product.image, startRect: rect }
      }));
    }

    let finalPrice = product.price;
    const variantDetailsForCart = {};

    Object.entries(selectedVariants).forEach(([optId, varId]) => {
      const opt = options.find(o => String(o.id) === String(optId));
      const v = variants.find(v => String(v.id) === String(varId));
      if (v) {
        finalPrice += (v.price_adjustment || 0);
        if (opt) variantDetailsForCart[opt.name] = v.name;
      }
    });

    const productWithVariants = {
      ...product,
      price: finalPrice,
      id: Object.keys(variantDetailsForCart).length > 0 
        ? `${product.id}-${Object.values(selectedVariants).join('-')}`
        : product.id,
      name: Object.keys(variantDetailsForCart).length > 0
        ? `${product.name} (${Object.values(variantDetailsForCart).join(', ')})`
        : product.name,
      originalId: product.id,
      selectedOptions: variantDetailsForCart
    };

    addItem(productWithVariants, qty);
    toast.success("Added to cart", {
      description: `${qty}x ${productWithVariants.name}`,
      position: "top-right",
      className: "w-fit ml-auto mt-16",
      duration: 3000,
    });
    setQty(1);
  };

  const handleRemove = () => {
    if (currentCartItemId) {
      removeItem(currentCartItemId);
      toast.success("Removed from cart", {
        position: "top-right",
        className: "w-fit ml-auto mt-16",
        duration: 3000,
      });
    }
  };

  const retry = () => window.location.reload();

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))]">
          <ErrorState
            title="Couldn't load this item"
            description={error}
            onRetry={retry}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-28 pb-28 sm:pb-12">
        <PageTransition>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <AnimatePresence mode="wait">
              {loading || !product ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3 }}
                >
                  <DetailSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="product-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-4 sm:mb-6 rounded-full text-foreground/70 hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-4 mr-1" />
                    Back
                  </Button>

                  <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative group"
                    >
                      <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden rounded-3xl bg-secondary/80 shadow-warm-lg">
                        <img
                          id="product-main-image"
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          onLoad={() => setImgLoaded(true)}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
                            imgLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
                          )}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 z-10">
                          {(Array.isArray(product.tags) ? product.tags : (typeof product.tags === 'string' && product.tags ? product.tags.split(',').map(s => s.trim()) : []))?.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              className={cn(
                                "rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-md transition-all",
                                t.toLowerCase().includes("bestseller") || t.toLowerCase().includes("favorite")
                                  ? "bg-primary/90 text-primary-foreground"
                                  : "bg-background/85 text-foreground"
                              )}
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col"
                    >

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {product.spicy && (
                          <Badge className="bg-primary text-primary-foreground border-0 rounded-full gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-bold shadow-sm">
                            <Flame className="size-3.5" /> Spicy
                          </Badge>
                        )}
                        {product.vegetarian && (
                          <Badge className="bg-emerald-600 text-white border-0 rounded-full gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-bold shadow-sm">
                            <Leaf className="size-3.5" /> Veg
                          </Badge>
                        )}
                        <div className="flex items-center gap-1.5 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                          <span>{avgRating} {reviews.length > 0 && `(${reviews.length})`}</span>
                        </div>
                      </div>

                      <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                        {product.name}
                      </h1>

                      <p className="mt-3 text-sm sm:text-lg text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>

                      {options.length > 0 && (
                        <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
                          {options.map(opt => {
                            const optVars = variants.filter(v => String(v.option_id) === String(opt.id));
                            if (optVars.length === 0) return null;
                            return (
                              <div key={opt.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-primary text-[11px] uppercase tracking-[0.2em]">{opt.name}</h3>
                                  {variantQtyInCart > 0 && (
                                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-2 py-1 rounded-md animate-in fade-in duration-300">
                                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                                        <ShoppingCart className="size-3" />
                                        <span>{variantQtyInCart} in cart</span>
                                      </div>
                                      <div className="w-[1px] h-3 bg-primary/20 mx-0.5"></div>
                                      <button
                                        onClick={handleRemove}
                                        className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider"
                                      >
                                        <Trash2 className="size-3" /> Clear
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                  {optVars.map(v => {
                                    const isSelected = String(selectedVariants[opt.id]) === String(v.id);
                                    const variantPrice = (product.price + (v.price_adjustment || 0)).toFixed(2);
                                    return (
                                      <button
                                        key={v.id}
                                        onClick={() => setSelectedVariants(prev => ({ ...prev, [opt.id]: v.id }))}
                                        className={cn(
                                          "flex flex-col items-center justify-center px-5 py-2 rounded-2xl border transition-all duration-300 min-w-[90px]",
                                          isSelected 
                                            ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(227,52,47,0.35)] scale-105" 
                                            : "border-border/60 bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"
                                        )}
                                      >
                                        <span className="text-xs sm:text-sm font-semibold">{v.name}</span>
                                        <span className={cn(
                                          "text-[10px] mt-0.5 font-medium tracking-wide",
                                          isSelected ? "text-primary-foreground/90" : "text-muted-foreground/70"
                                        )}>
                                          ${variantPrice}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/60">
                        <div className="flex items-center justify-between gap-3 mb-5">
                          <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">Customer Reviews</h2>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/review/${id}`)} className="rounded-full text-xs sm:text-sm">
                            <Edit className="size-3.5 mr-1.5" /> Write a review
                          </Button>
                        </div>

                        {reviews.length === 0 ? (
                          <div className="bg-secondary/40 rounded-2xl p-6 text-center text-muted-foreground">
                            <MessageCircle className="size-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No reviews yet. Be the first to try and review!</p>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {reviews.map((review) => (
                              <div key={review.id} className="bg-card border border-border/60 rounded-2xl p-4 sm:p-5">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="size-9 rounded-full bg-secondary flex items-center justify-center">
                                      <User className="size-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground text-sm">Customer</h4>
                                      <div className="flex items-center gap-0.5 mt-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <Star key={star} className={cn("size-3", star <= review.rating ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted")} />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Desktop Action Bar */}
                      <div className="hidden sm:flex items-center justify-between gap-6 mt-8 pt-8 border-t border-border/60">
                        <div className="flex flex-col">
                          <span className="font-serif text-3xl lg:text-4xl font-bold text-primary tabular-nums whitespace-nowrap">
                            ${(() => {
                              let p = product.price;
                              Object.values(selectedVariants).forEach(varId => {
                                const v = variants.find(v => String(v.id) === String(varId));
                                if (v) p += (v.price_adjustment || 0);
                              });
                              return (p * qty).toFixed(2);
                            })()}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap mt-0.5 font-medium">
                            ({qty} {qty > 1 ? 'items' : 'item'})
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1 rounded-full bg-secondary border border-border/60 p-1">
                            <button
                              type="button"
                              onClick={() => setQty(Math.max(1, qty - 1))}
                              className="size-10 rounded-full bg-background hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shrink-0"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={qty}
                              onChange={handleQtyChange}
                              className="w-12 text-center font-semibold text-lg bg-transparent text-foreground outline-none border-0 focus:outline-none focus:ring-0 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => setQty(qty + 1)}
                              className="size-10 rounded-full bg-background hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shrink-0"
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>

                          <Button
                            onClick={handleAdd}
                            size="lg"
                            className="h-13 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm text-base"
                          >
                            <ShoppingCart className="size-5 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </main>

      {/* Mobile Sticky Bottom Action Bar (Floating Glass Pill) */}
      {!loading && product && !isCartOpen && (
        <div className="block sm:hidden fixed bottom-6 inset-x-4 z-50 pointer-events-none">
          <div className="flex items-center gap-2 bg-card/85 backdrop-blur-xl border border-border/50 p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.25)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] pointer-events-auto">
            <div className="flex flex-col min-w-[90px] pl-3 shrink-0">
              <span className="font-serif text-xl font-bold text-primary tabular-nums whitespace-nowrap truncate leading-none">
                ${(() => {
                  let p = product.price;
                  Object.values(selectedVariants).forEach(varId => {
                    const v = variants.find(v => String(v.id) === String(varId));
                    if (v) p += (v.price_adjustment || 0);
                  });
                  return (p * qty).toFixed(2);
                })()}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap truncate mt-0.5">
                ({qty} {qty > 1 ? 'items' : 'item'})
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-secondary/80 p-1 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="size-8 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shrink-0"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max="999"
                value={qty}
                onChange={handleQtyChange}
                className="w-8 text-center font-bold text-sm bg-transparent text-foreground outline-none border-0 focus:outline-none focus:ring-0 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="size-8 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shrink-0"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <Button
              onClick={handleAdd}
              size="lg"
              className="h-12 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_4px_14px_rgba(227,52,47,0.3)] shrink-0 text-sm"
            >
              <ShoppingCart className="size-4 mr-1.5" />
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
