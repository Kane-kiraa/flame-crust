"use client";
import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { foodItems } from "@/lib/food-data";
import { fetchFoodItems } from "@/lib/food-api";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Featured() {
  const addItem = useCart((s) => s.addItem);
  const lines = useCart((s) => s.lines);
  const [featured, setFeatured] = useState(foodItems.filter((f) => f.popular).slice(0, 3));

  useEffect(() => {
    const controller = new AbortController();
    fetchFoodItems(controller.signal)
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          const popularItems = items.filter((item) => item.popular).slice(0, 3);
          if (popularItems.length > 0) {
            setFeatured(popularItems);
          }
        }
      })
      .catch(() => { });
    return () => controller.abort();
  }, []);

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    window.dispatchEvent(
      new CustomEvent("fly-to-cart", {
        detail: {
          image: item.image,
          startRect: rect,
        },
      })
    );

    const inCart = lines.find((l) => l.id === item.id);
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      description: inCart ? `Now ${inCart.qty + 1} in your order` : "Tap the cart icon to checkout"
    });
  };

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
              <TrendingUp className="size-3.5" />
              Trending this week
            </div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1]">
              The dishes our fans
              <br />
              <span className="text-gradient-warm italic">can't stop ordering.</span>
            </h2>
          </div>
          <Button
            variant="outline"
            asChild
            className="self-start sm:self-auto rounded-full border-foreground/15 hover:border-foreground/30 hover:bg-secondary h-11 px-5 font-semibold"
          >
            <Link to="/menu" className="flex items-center gap-1.5">
              See full menu
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {featured.map((item, i) => {
            const inCart = lines.find((l) => l.id === item.id);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-warm hover:shadow-warm-lg card-lift flex flex-col justify-between"
              >
                <Link to={`/product/${item.id}`} className="block">
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm">
                        <TrendingUp className="size-3" />
                        #{i + 1} this week
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">
                      <Star className="size-3 fill-accent text-accent" />
                      {item.rating || "4.9"}
                    </div>

                    <div className="absolute bottom-2 left-2 right-12 sm:bottom-3 sm:left-3 sm:right-14">
                      <h3 className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-white/90 mt-0.5 sm:mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 bg-card">
                  <div>
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium block">
                      From
                    </span>
                    <div className="font-serif text-lg sm:text-2xl font-bold text-foreground leading-none">
                      ${Number(item.price || 0).toFixed(2)}
                    </div>
                  </div>

                  <Button
                    onClick={(e) => handleAddToCart(e, item)}
                    className={cn(
                      "h-9 px-3 sm:h-11 sm:px-5 rounded-full font-semibold shadow-warm transition-all group/btn flex items-center gap-1 sm:gap-1.5 active:scale-95 shrink-0",
                      inCart
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {inCart ? (
                      <Fragment>
                        <Check className="size-3 sm:size-4" />
                        <span className="text-xs sm:text-sm whitespace-nowrap">({inCart.qty})</span>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <Plus className="size-3 sm:size-4 group-hover/btn:rotate-90 transition-transform" />
                        <span className="text-xs sm:text-sm whitespace-nowrap">Add</span>
                      </Fragment>
                    )}
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default Featured;
