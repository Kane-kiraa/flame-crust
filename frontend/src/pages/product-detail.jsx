"use client";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { useCart } from "@/lib/cart-store";
import { list, get } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCart((s) => s.addItem);
  const lines = useCart((s) => s.lines);
  const inCart = lines.find((l) => l.id === id);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const [prod, allOptions, allVariants, allReviews] = await Promise.all([
          get("products", id),
          list("product_options"),
          list("product_variants"),
          list("reviews")
        ]);
        
        setProduct(prod);
        
        const prodOptions = (allOptions || []).filter(o => String(o.product_id) === String(id));
        const prodVariants = (allVariants || []).filter(v => prodOptions.some(o => String(o.id) === String(v.option_id)) && v.active);
        
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
        
        const productReviews = (allReviews || []).filter(r => String(r.product_id) === String(id) && r.status === 'APPROVED');
        setReviews(productReviews.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
        
        setLoading(false);
      } catch (err) {
        setError("Product not found");
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1) : "New";

  const handleAdd = () => {
    if (!product) return;
    
    let finalPrice = product.price;
    const selectedVariantDetails = {};
    
    Object.entries(selectedVariants).forEach(([optId, varId]) => {
      const opt = options.find(o => String(o.id) === String(optId));
      const v = variants.find(v => String(v.id) === String(varId));
      if (v) {
        finalPrice += (v.price_adjustment || 0);
        if (opt) selectedVariantDetails[opt.name] = v.name;
      }
    });

    const productWithVariants = {
      ...product,
      price: finalPrice,
      id: `${product.id}-${Object.values(selectedVariants).join('-')}`,
      name: Object.keys(selectedVariantDetails).length > 0 
            ? `${product.name} (${Object.values(selectedVariantDetails).join(', ')})`
            : product.name,
      originalId: product.id,
      selectedOptions: selectedVariantDetails
    };

    for (let i = 0; i < qty; i++) {
      addItem(productWithVariants);
    }
    toast.success(`${product.name} added to cart`, {
      description: qty > 1 ? `${qty} items in your order` : "Tap the cart icon to checkout",
    });
    setQty(1);
  };

  const retry = () => window.location.reload();

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24">
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

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <CartDrawer />
        <main className="flex-1 pt-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            <DetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-24 sm:pt-28">
        <PageTransition>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 rounded-full text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative group"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary shadow-warm-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                    {(Array.isArray(product.tags) ? product.tags : (typeof product.tags === 'string' && product.tags ? product.tags.split(',').map(s=>s.trim()) : []))?.slice(0, 3).map((t) => (
                      <Badge
                        key={t}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md",
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col"
              >
                <div className="flex gap-2 mb-3">
                  {product.spicy && (
                    <Badge className="bg-primary/15 text-primary border-0 rounded-full gap-1">
                      <Flame className="size-3" /> Spicy
                    </Badge>
                  )}
                  {product.vegetarian && (
                    <Badge className="bg-green-600/15 text-green-700 border-0 rounded-full gap-1">
                      <Leaf className="size-3" /> Vegetarian
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full font-medium">
                    <Star className="size-4 fill-yellow-500" />
                    <span>{avgRating} {reviews.length > 0 && `(${reviews.length})`}</span>
                  </div>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>

                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                {options.length > 0 && (
                  <div className="mt-8 space-y-6">
                    {options.map(opt => {
                      const optVars = variants.filter(v => String(v.option_id) === String(opt.id));
                      if (optVars.length === 0) return null;
                      return (
                        <div key={opt.id} className="space-y-3">
                          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">{opt.name}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {optVars.map(v => {
                              const isSelected = String(selectedVariants[opt.id]) === String(v.id);
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedVariants(prev => ({ ...prev, [opt.id]: v.id }))}
                                  className={cn(
                                    "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 bg-card"
                                  )}
                                >
                                  <span className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>{v.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-border/60">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl font-bold text-foreground">Customer Reviews</h2>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/review/${id}`)} className="rounded-full">
                      <Edit className="size-4 mr-2" /> Write a review
                    </Button>
                  </div>
                  
                  {reviews.length === 0 ? (
                    <div className="bg-secondary/40 rounded-2xl p-8 text-center text-muted-foreground">
                      <MessageCircle className="size-12 mx-auto mb-4 opacity-20" />
                      <p>No reviews yet. Be the first to try and review!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-card border border-border/60 rounded-2xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                                <User className="size-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm">Customer</h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} className={cn("size-3", star <= review.rating ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted")} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-foreground/80">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-8 border-t border-border/60">
                  <div className="flex items-baseline gap-2 mr-auto">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-primary">
                      ${(() => {
                        let p = product.price;
                        Object.values(selectedVariants).forEach(varId => {
                          const v = variants.find(v => String(v.id) === String(varId));
                          if (v) p += (v.price_adjustment || 0);
                        });
                        return p.toFixed(2);
                      })()}
                    </span>
                    <span className="text-sm text-muted-foreground">per item</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-secondary border border-border/60 p-1">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-10 rounded-full bg-background hover:bg-primary flex items-center justify-center">
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-8 text-center font-semibold text-lg">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="size-10 rounded-full bg-background hover:bg-primary flex items-center justify-center">
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <Button onClick={handleAdd} size="lg" className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm">
                    <ShoppingCart className="size-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

export default ProductDetailPage;
