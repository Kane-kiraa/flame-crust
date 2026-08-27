"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchFoodItems, getCachedFoodItems } from "@/lib/food-api";
import { FoodCard } from "./food-card";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";

function Menu() {
  const [items, setItems] = useState(() => getCachedFoodItems());
  const [loading, setLoading] = useState(() => getCachedFoodItems().length === 0);

  useEffect(() => {
    let isMounted = true;
    if (getCachedFoodItems().length === 0) {
      setLoading(true);
    }
    fetchFoodItems()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => void 0)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayedItems = items.slice(0, 8);

  return (
    <section id="menu" className="pt-6 pb-12 sm:py-16 lg:py-24 relative">
      <div className="absolute inset-0 -z-10 bg-background" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Utensils className="size-3.5" />
            Our Menu
          </span>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Pick your <span className="text-gradient-warm italic">flavor</span> of comfort
          </h2>
          <p className="mt-2 text-xs sm:text-base text-muted-foreground max-w-md mx-auto">
            Every dish is made-to-order with the good stuff — no shortcuts, no freezers, no compromises.
          </p>
        </div>

        {loading ? (
          <CardGridSkeleton count={8} className="mt-6 sm:mt-10" />
        ) : displayedItems.length === 0 ? (
          <div className="mt-6 sm:mt-10 text-center text-muted-foreground">
            No items available at the moment.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="mt-6 sm:mt-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
          >
            {displayedItems.map((item, idx) => (
              <FoodCard key={item.id} item={item} index={idx} />
            ))}
          </motion.div>
        )}

        <div className="mt-8 sm:mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="h-11 sm:h-12 px-7 sm:px-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base font-bold shadow-warm hover:shadow-warm-lg group transition-all active:scale-95"
          >
            <Link to="/menu" className="inline-flex items-center gap-2">
              <span>Explore Full Menu</span>
              <ArrowRight className="size-4 sm:size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { Menu };

