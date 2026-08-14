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
    } catch (e) {}
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
    } catch (err) {}
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      description: inCart ? `Now ${inCart.qty + 1} in your order` : "Tap the cart icon to checkout"
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.16, 1, 0.3, 1]
      }}
      className="group card-lift relative flex flex-col overflow-hidden rounded-3xl bg-card border border-border/60 shadow-warm hover:shadow-warm-lg"
    >
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
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {(Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' && item.tags ? item.tags.split(',').map(s=>s.trim()) : []))?.slice(0, 2).map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                  t.toLowerCase().includes("bestseller") || t.toLowerCase().includes("favorite")
                    ? "bg-primary/90 text-primary-foreground"
                    : "bg-background/85 text-foreground"
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
            <Star className="size-3 fill-accent text-accent" />
            {item.rating}
          </div>
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {item.spicy && (
              <span className="flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground px-2 py-0.5 text-[10px] font-semibold uppercase">
                <Flame className="size-3" />
                Spicy
              </span>
            )}
            {item.vegetarian && (
              <span className="flex items-center gap-1 rounded-full bg-green-600/90 text-white px-2 py-0.5 text-[10px] font-semibold uppercase">
                <Leaf className="size-3" />
                Veg
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/product/${item.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-serif text-xl font-bold text-foreground leading-tight">{item.name}</h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{item.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Price</span>
            <span className="font-serif text-2xl font-bold text-foreground">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleAdd}
            size="lg"
            className={cn(
              "h-12 px-5 rounded-full font-semibold shadow-warm transition-all group/btn",
              inCart
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {inCart ? (
              <Fragment>
                <Check className="size-4" />
                <span className="ml-1">In cart ({inCart.qty})</span>
              </Fragment>
            ) : (
              <Fragment>
                <Plus className="size-4 group-hover/btn:rotate-90 transition-transform" />
                <span className="ml-1">Add</span>
              </Fragment>
            )}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export { FoodCard };
