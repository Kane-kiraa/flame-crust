"use client";
import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Star, Flame, Leaf, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function FoodCard({ item, index = 0 }) {
  const addItem = useCart((s) => s.addItem);
  const lines = useCart((s) => s.lines);
  const inCart = lines.find((l) => l.id === item.id);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("customerFavorites") || "[]");
      setIsFavorite(favs.some(f => String(f.id) === String(item.id)));
    } catch (e) { }
  }, [item.id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let favs = JSON.parse(localStorage.getItem("customerFavorites") || "[]");
      if (isFavorite) {
        favs = favs.filter(f => String(f.id) !== String(item.id));
      } else {
        favs.push(item);
      }
      localStorage.setItem("customerFavorites", JSON.stringify(favs));
      setIsFavorite(!isFavorite);
      window.dispatchEvent(new Event("favoritesChanged"));
    } catch (err) { }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("fly-to-cart", {
      detail: { image: item.image, startRect: rect }
    }));

    addItem(item);
  };

  return (
    <article className="group card-lift relative flex flex-col overflow-hidden rounded-3xl bg-card border border-border/60 shadow-warm hover:shadow-warm-lg animate-card-fade-in">
      <Link to={`/product/${item.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur shadow-sm hover:bg-background transition-colors z-10"
          >
            <Heart className={cn("size-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-foreground/70")} />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          <div className="absolute top-2 left-2 right-11 sm:top-3 sm:left-3 sm:right-12 flex flex-wrap gap-1 sm:gap-1.5">
            {(Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' && item.tags ? item.tags.split(',').map(s => s.trim()) : []))?.slice(0, 2).map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] sm:px-2.5 sm:py-1 sm:text-[11px] font-semibold backdrop-blur-md whitespace-nowrap",
                  t.toLowerCase().includes("bestseller") || t.toLowerCase().includes("favorite")
                    ? "bg-primary/90 text-primary-foreground"
                    : "bg-background/85 text-foreground"
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-semibold text-foreground shadow-sm">
            <Star className="size-3 fill-accent text-accent" />
            {item.rating}
          </div>
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex flex-wrap gap-1">
            {item.spicy && (
              <span className="flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase">
                <Flame className="size-2.5 sm:size-3" />
                Spicy
              </span>
            )}
            {item.vegetarian && (
              <span className="flex items-center gap-1 rounded-full bg-green-600/90 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase">
                <Leaf className="size-2.5 sm:size-3" />
                Veg
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <Link to={`/product/${item.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-serif text-[15px] sm:text-xl font-bold text-foreground leading-tight line-clamp-2">{item.name}</h3>
        </Link>
        <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 flex-1">{item.description}</p>
        <div className="mt-2 sm:mt-5 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:block">Price</span>
            <span className="font-serif text-base sm:text-2xl font-bold text-foreground leading-none sm:leading-normal">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleAdd}
            size="lg"
            className={cn(
              "h-8 px-2.5 sm:h-12 sm:px-5 rounded-full font-semibold shadow-warm transition-all group/btn text-[11px] sm:text-sm w-auto shrink-0",
              inCart
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {inCart ? (
              <Fragment>
                <Check className="size-3 sm:size-4" />
                <span className="ml-1 hidden sm:inline">In cart ({inCart.qty})</span>
                <span className="ml-0.5 sm:hidden">({inCart.qty})</span>
              </Fragment>
            ) : (
              <Fragment>
                <Plus className="size-3 sm:size-4 group-hover/btn:rotate-90 transition-transform" />
                <span className="ml-1">Add</span>
              </Fragment>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

export { FoodCard };
