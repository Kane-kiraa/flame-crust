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
    <section id="menu" className="py-20 lg:py-28 relative">
      <div className="absolute inset-0 -z-10 bg-background" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
            <Utensils className="size-3.5" />
            Our Menu
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05]">
            Pick your <span className="text-gradient-warm italic">flavor</span> of comfort
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Every dish is made-to-order with the good stuff — no shortcuts, no freezers, no compromises.
          </p>
        </div>

        {loading ? (
          <CardGridSkeleton count={8} className="mt-12" />
        ) : displayedItems.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground">
            No items available at the moment.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="mt-12 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
          >
            {displayedItems.map((item, idx) => (
              <FoodCard key={item.id} item={item} index={idx} />
            ))}
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-warm hover:shadow-warm-lg group transition-all"
          >
            <Link to="/menu" className="inline-flex items-center gap-2">
              <span>Show More</span>
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { Menu };

