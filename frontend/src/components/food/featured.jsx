"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";
import { fetchFoodItems, getCachedFoodItems } from "@/lib/food-api";
import { FoodCard } from "./food-card";

export function Featured() {
  const [featured, setFeatured] = useState(() => {
    const cached = getCachedFoodItems();
    return cached.filter((item) => item.popular).slice(0, 4);
  });
  const [loading, setLoading] = useState(() => {
    const cached = getCachedFoodItems();
    return cached.filter((item) => item.popular).length === 0;
  });

  useEffect(() => {
    let isMounted = true;
    if (getCachedFoodItems().length === 0) {
      setLoading(true);
    }
    fetchFoodItems()
      .then((items) => {
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const popularItems = items.filter((item) => item.popular).slice(0, 4);
          if (popularItems.length > 0) {
            setFeatured(popularItems);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && featured.length === 0) {
    return null;
  }

  return (
    <section className="pt-4 pb-5 sm:pt-10 sm:pb-8 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Compact Single-Row Header */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider">
            <TrendingUp className="size-3" />
            Trending this week
          </div>
          <Link 
            to="/menu" 
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>See full menu</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3.5 sm:mb-6">
          The dishes our fans <span className="text-gradient-warm italic">can't stop ordering.</span>
        </h2>

        {/* Product Cards Grid (Symmetrical 2x2 on Mobile with Heart Favorite Button & Trending Badges) */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[4/3] bg-card border border-border/60 rounded-2xl animate-pulse shadow-warm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {featured.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} trendingRank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Featured;
