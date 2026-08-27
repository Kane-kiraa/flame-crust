"use client";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { categoryMeta, categoryOrder as defaultCategoryOrder } from "@/lib/food-data";
import { fetchFoodItems, fetchCategories, getCachedFoodItems, getCachedCategories } from "@/lib/food-api";
import { Navbar } from "@/components/food/navbar";
import { FoodCard } from "@/components/food/food-card";
import { CartDrawer } from "@/components/food/cart-drawer";
import { SearchInput } from "@/components/shared/search-input";
import { ArcCategoryNav } from "@/components/food/arc-category-nav";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Flame, Sparkles, Filter, Check, Star, Leaf, LayoutGrid } from "lucide-react";

const FoodGrid = ({ items }) => {
  return (
    <div className="mt-5 sm:mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
      {items.map((item, idx) => (
        <FoodCard key={item.id} item={item} index={idx} />
      ))}
    </div>
  );
};

function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  const [active, setActive] = useState(categoryFromUrl);
  const [dietaryFilter, setDietaryFilter] = useState("all"); // 'all' | 'spicy' | 'veg' | 'popular'
  const [itemsFromApi, setItemsFromApi] = useState(() => getCachedFoodItems());
  const [categories, setCategories] = useState(() => getCachedCategories());
  const [loading, setLoading] = useState(() => getCachedFoodItems().length === 0);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  useEffect(() => {
    setActive(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setVisibleCount(8);
  }, [active, search, dietaryFilter]);

  useEffect(() => {
    let isMounted = true;
    if (getCachedFoodItems().length === 0) {
      setLoading(true);
    }
    setError(null);
    Promise.all([
      fetchFoodItems(),
      fetchCategories()
    ])
      .then(([items, cats]) => {
        if (isMounted) {
          setItemsFromApi(items);
          setCategories(cats);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (!itemsFromApi || itemsFromApi.length === 0) {
            setError(err.message || "Failed to load menu items");
          }
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const allItems = itemsFromApi || [];

  const filteredItems = useMemo(() => {
    let items = active === "all" ? allItems : allItems.filter((i) => i.category === active);
    
    // Dietary filter
    if (dietaryFilter === "spicy") {
      items = items.filter((i) => i.spicy);
    } else if (dietaryFilter === "veg") {
      items = items.filter((i) => i.vegetarian);
    } else if (dietaryFilter === "popular") {
      items = items.filter((i) => i.popular || (Array.isArray(i.tags) && i.tags.some(t => t.toLowerCase().includes("bestseller"))));
    }

    // Text search
    if (search.trim()) {
      const lower = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.description?.toLowerCase().includes(lower) ||
          (Array.isArray(i.tags) ? i.tags : []).some(t => t.toLowerCase().includes(lower))
      );
    }
    return items;
  }, [allItems, active, search, dietaryFilter]);

  const visibleItems = useMemo(() => {
    if (active !== "all" && dietaryFilter === "all" && !search.trim()) {
      return filteredItems;
    }
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount, active, dietaryFilter, search]);

  const handleCategoryChange = (cat) => {
    setActive(cat);
    setDietaryFilter("all");
    setSearchParams({ category: cat });
  };

  const retry = () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all([
      fetchFoodItems(controller.signal),
      fetchCategories(controller.signal)
    ])
      .then(([items, cats]) => {
        setItemsFromApi(items);
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load menu items");
          setLoading(false);
        }
      });
  };

  const dbActiveCat = categories.find(c => c.slug === active);
  const meta = categoryMeta[active] || (dbActiveCat ? { label: dbActiveCat.name, description: `Explore our delicious ${dbActiveCat.name} made fresh to order.`, icon: "🍽️" } : categoryMeta.all);
  const currentCategoryOrder = categories.length > 0 ? ["all", ...categories.map(c => c.slug)] : defaultCategoryOrder;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 min-h-[calc(100vh-140px)] pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-24">
        <PageTransition>
          <section className="pt-2 pb-16 sm:pb-24">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
              
              {/* Header Title (Compact on mobile, lavish on desktop) */}
              <div className="text-center max-w-2xl mx-auto pb-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  Our Menu
                </span>
                <h2 className="mt-0 sm:mt-4 font-serif text-2xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                  Pick your <span className="text-gradient-warm italic">flavor</span> of comfort
                </h2>
                <p className="hidden sm:block mt-2 sm:mt-4 text-xs sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Every dish is made-to-order with fresh sourdough & premium ingredients.
                </p>
              </div>

              {/* Mobile & Desktop Search Bar */}
              <div className="mt-2 sm:mt-4 max-w-md sm:max-w-xl mx-auto px-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search for pizza, burgers, sides..."
                  className="w-full shadow-xs"
                />
              </div>

              {/* Curved / Arched Dome Category Selector */}
              <div className="mt-2 sm:mt-5">
                <ArcCategoryNav
                  categories={categories}
                  active={active}
                  onSelectCategory={handleCategoryChange}
                  currentCategoryOrder={currentCategoryOrder}
                />
              </div>

              {/* Quick Dietary Filters & Count Bar */}
              <div className="mt-2 sm:mt-5 flex flex-wrap items-center justify-between gap-2 border-y border-border/40 py-2 sm:py-3 text-[11px] sm:text-sm overflow-hidden">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 -my-2 px-1 w-full sm:w-auto">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 shrink-0 mr-1">
                    <Filter className="size-3.5" /> Filter:
                  </span>
                  {[
                    { id: "all", label: "All", icon: null },
                    { id: "popular", label: "Popular", icon: Star },
                    { id: "spicy", label: "Spicy", icon: Flame },
                    { id: "veg", label: "Vegetarian", icon: Leaf },
                  ].map((filter) => {
                    const isSelected = dietaryFilter === filter.id;
                    const IconComponent = filter.icon;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setDietaryFilter(filter.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 shrink-0 cursor-pointer border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_12px_rgba(227,52,47,0.3)]"
                            : "bg-card text-muted-foreground border-border/40 shadow-sm hover:bg-secondary hover:text-foreground hover:border-border/60"
                        )}
                      >
                        {IconComponent && (
                          <IconComponent className={cn("size-3.5", isSelected ? "text-primary-foreground" : "text-muted-foreground/70")} />
                        )}
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] sm:text-xs text-muted-foreground font-medium shrink-0">
                  Showing <span className="font-bold text-foreground">{filteredItems.length}</span> {active === "all" ? "dishes" : meta.label}
                </div>
              </div>

              {/* Category Description Banner */}
              <div className="mt-3 min-h-[32px]">
                <p className="text-center text-xs sm:text-sm text-muted-foreground italic max-w-lg mx-auto">
                  {meta.description}
                </p>
              </div>

              {/* Food Items Grid with Bottom Padding for Mobile Nav */}
              <div className="min-h-[70vh] flex flex-col justify-start pb-28 sm:pb-16">
                {error ? (
                  <ErrorState
                    title="Couldn't load the menu"
                    description={error}
                    onRetry={retry}
                    className="py-16"
                  />
                ) : loading ? (
                  <CardGridSkeleton count={8} className="mt-6 sm:mt-8" />
                ) : filteredItems.length === 0 ? (
                  <div className="mt-10 text-center py-16">
                    <p className="font-serif text-xl sm:text-2xl font-bold text-foreground">No dishes found</p>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      Try selecting a different category or clearing search & filters.
                    </p>
                    {(search || dietaryFilter !== "all" || active !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setDietaryFilter("all");
                          handleCategoryChange("all");
                        }}
                        className="mt-4 rounded-full text-xs font-semibold"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <FoodGrid items={visibleItems} />

                    {active === "all" && dietaryFilter === "all" && !search.trim() && visibleCount < filteredItems.length && (
                      <div className="mt-10 sm:mt-12 text-center flex flex-col items-center gap-3">
                        <Button
                          onClick={handleLoadMore}
                          size="lg"
                          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-sm sm:text-base font-semibold shadow-warm transition-all duration-300 active:scale-95 min-w-[260px] sm:min-w-[280px]"
                        >
                          Load More Foods ({filteredItems.length - visibleCount} remaining)
                        </Button>
                        <p className="text-xs text-muted-foreground font-medium">
                          Showing {visibleCount} of {filteredItems.length} foods
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </PageTransition>
      </main>
    </div>
  );
}

export default MenuPage;
