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
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  const [active, setActive] = useState(categoryFromUrl);
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
  }, [active, search]);

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
    if (search.trim()) {
      const lower = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.description?.toLowerCase().includes(lower)
      );
    }
    return items;
  }, [allItems, active, search]);

  const visibleItems = useMemo(() => {
    if (active !== "all") {
      return filteredItems;
    }
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount, active]);

  const handleCategoryChange = (cat) => {
    setActive(cat);
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
  const meta = categoryMeta[active] || (dbActiveCat ? { label: dbActiveCat.name, description: `Explore our delicious ${dbActiveCat.name} made just for you.`, icon: "🍽️" } : categoryMeta.all);
  const currentCategoryOrder = categories.length > 0 ? ["all", ...categories.map(c => c.slug)] : defaultCategoryOrder;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 min-h-[calc(100vh-140px)] pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-28">
        <PageTransition>
          <section className="py-6 sm:py-10 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto">
                <span className="inline-block rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
                  Our Menu
                </span>
                <h2 className="mt-2 sm:mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05]">
                  Pick your <span className="text-gradient-warm italic">flavor</span> of comfort
                </h2>
                <p className="mt-2 sm:mt-4 text-xs sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Every dish is made-to-order with the good stuff — no shortcuts, no freezers, no compromises.
                </p>
              </div>

              <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="w-full sm:w-auto overflow-x-auto no-scrollbar py-1 sm:py-2 px-1">
                  <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max mx-auto">
                    {currentCategoryOrder.map((cat) => {
                      const dbCat = categories.find(c => c.slug === cat);
                      const m = categoryMeta[cat] || {
                        label: dbCat ? dbCat.name : cat,
                        icon: "🍽️"
                      };
                      const isActive = active === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={cn(
                            "relative shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-colors duration-200 whitespace-nowrap border-2 border-transparent",
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-warm"
                              : "bg-secondary/80 text-foreground/80 hover:bg-secondary hover:text-foreground hover:border-border/60"
                          )}
                        >
                          <span className="text-base">{m.icon}</span>
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search menu..."
                  className="w-full sm:w-64 shrink-0"
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 sm:mt-6 text-center text-xs sm:text-base text-muted-foreground italic"
                >
                  {meta.description}
                </motion.p>
              </AnimatePresence>

              <div className="min-h-[520px] flex flex-col justify-start">
                {error ? (
                  <ErrorState
                    title="Couldn't load the menu"
                    description={error}
                    onRetry={retry}
                    className="py-16"
                  />
                ) : loading ? (
                  <CardGridSkeleton count={8} className="mt-6 sm:mt-10" />
                ) : filteredItems.length === 0 ? (
                  <div className="mt-10 text-center py-16">
                    <p className="font-serif text-2xl font-bold text-foreground">No items found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try a different search or category.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      key={active + search}
                      className="mt-6 sm:mt-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
                    >
                      {visibleItems.map((item) => (
                        <FoodCard key={item.id} item={item} />
                      ))}
                    </div>

                    {active === "all" && visibleCount < filteredItems.length && (
                      <div className="mt-12 text-center flex flex-col items-center gap-3">
                        <Button
                          onClick={handleLoadMore}
                          size="lg"
                          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-warm transition-all duration-300 active:scale-95 min-w-[280px]"
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
