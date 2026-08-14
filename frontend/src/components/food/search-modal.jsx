import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Flame, Leaf, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/api";
import { cn } from "@/lib/utils";

export function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getProducts().then(data => {
        setProducts(Array.isArray(data) ? data : (data.products || []));
        setLoading(false);
      });
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Lock scroll
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => document.body.style.overflow = orig;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' && p.tags ? p.tags.split(',').map(s=>s.trim()) : [])).some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose(false)}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-start justify-center pt-20 sm:pt-32"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-card rounded-2xl sm:rounded-3xl shadow-2xl border border-border/60 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Input */}
          <div className="relative flex items-center border-b border-border/60 px-4 sm:px-6 py-4">
            <Search className="size-6 text-primary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pizza, burgers, or ingredients..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-lg sm:text-xl text-foreground placeholder:text-muted-foreground/60"
            />
            <button 
              onClick={() => onClose(false)}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            {query.length <= 1 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Search className="size-12 mx-auto mb-4 opacity-20" />
                <p>Type at least 2 characters to search</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filtered.map(product => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onClose(false);
                      navigate(`/product/${product.id}`);
                    }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 transition-colors text-left group"
                  >
                    <div className="size-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
                        {product.spicy && <Flame className="size-3 text-primary shrink-0" />}
                        {product.vegetarian && <Leaf className="size-3 text-green-600 shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 pl-2">
                      <span className="font-bold text-foreground">${product.price.toFixed(2)}</span>
                      <div className="size-8 rounded-full bg-background border border-border/60 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-secondary/30 border-t border-border/60 px-4 py-3 flex justify-between items-center text-xs text-muted-foreground">
            <span>Press <kbd className="font-mono bg-background border rounded px-1.5 py-0.5">ESC</kbd> to close</span>
            <span>Search powered by Flame & Crust</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
