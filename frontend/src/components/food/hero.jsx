"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Star, Truck, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "4.9", label: "Avg rating", icon: Star },
  { value: "25min", label: "Delivery", icon: Clock },
  { value: "30k+", label: "Orders served", icon: Truck },
];

function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between pt-[calc(4.25rem+env(safe-area-inset-top))] sm:pt-20 md:pt-24 lg:pt-24 pb-0 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-background" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-auto w-full py-2 sm:py-4 lg:py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center md:text-left flex flex-col items-center md:items-start"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/80 border border-border/60 pl-1.5 pr-4 py-1.5 text-xs sm:text-sm font-medium text-foreground/80 backdrop-blur">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground">
                <Flame className="size-3.5" />
              </span>
              <span>Wood-fired since 2014</span>
              <Sparkles className="size-3.5 text-accent" />
            </div>

            <h1 className="mt-4 sm:mt-5 font-serif font-bold tracking-tight text-foreground text-3xl sm:text-5xl md:text-5xl lg:text-7xl xl:text-8xl leading-[1.06] sm:leading-[1.02]">
              Cravings,
              <br />
              <span className="relative inline-block">
                <span className="text-gradient-warm">delivered hot</span>
                <svg
                  viewBox="0 0 320 18"
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 text-primary/40"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 12 Q 80 2, 160 10 T 318 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              <span className="italic font-medium text-foreground/90">in 25 min.</span>
            </h1>

            <p className="mt-3 sm:mt-4 text-xs sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
              Wood-fired sourdough pizzas, hand-rolled pizza bagels, and smashed Angus burgers — crafted by chefs who actually care, and delivered to your door before the cheese stops bubbling.
            </p>

            {/* Responsive Actions */}
            <div className="mt-5 sm:mt-7 flex flex-row gap-2.5 sm:gap-4 justify-center md:justify-start max-w-sm sm:max-w-none w-full sm:w-auto">
              <Button
                size="lg"
                asChild
                className="flex-1 sm:flex-initial h-11 sm:h-13 px-5 sm:px-8 text-xs sm:text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm group"
              >
                <Link to="/menu" className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <span>Order now</span>
                  <ArrowRight className="size-4 sm:size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="flex-1 sm:flex-initial h-11 sm:h-13 px-4 sm:px-8 text-xs sm:text-base rounded-full bg-background/60 backdrop-blur border-foreground/15 hover:border-foreground/30 hover:bg-secondary"
              >
                <Link to="/menu" className="flex items-center justify-center">See menu</Link>
              </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-5 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 md:gap-4 lg:gap-6 max-w-md w-full mx-auto md:mx-0 bg-secondary/30 sm:bg-transparent rounded-2xl p-2.5 sm:p-0 border border-border/40 sm:border-0">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-0.5 sm:mb-1">
                    <s.icon className="size-3.5 sm:size-4 text-accent fill-accent" />
                    <span className="font-serif text-base sm:text-2xl lg:text-3xl font-bold text-foreground">
                      {s.value}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground font-medium truncate">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative aspect-square max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-xl mx-auto w-full mt-4 md:mt-0"
          >
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="size-[90%] rounded-full border-2 border-dashed border-primary/20 animate-slow-spin" />
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-2 sm:inset-4 rounded-full overflow-hidden shadow-warm-lg ring-4 ring-background"
            >
              <img
                src="https://res.cloudinary.com/gdkctwwo/image/upload/v1787503337/pizza.jpg"
                alt="Signature wood-fired pepperoni pizza"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              className="absolute top-1 left-1 sm:-left-3 bg-background rounded-2xl shadow-warm-lg p-1.5 sm:p-3.5 border border-border/60 rotate-[-6deg] scale-80 sm:scale-100 origin-top-left"
            >
              <div className="flex items-center gap-1 text-accent">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3 sm:size-4 fill-accent" />
                ))}
              </div>
              <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs lg:text-sm font-semibold text-foreground">
                12,400+ reviews
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              className="absolute bottom-4 right-1 sm:-right-3 bg-foreground text-background rounded-2xl shadow-warm-lg p-1.5 sm:p-3.5 rotate-[5deg] scale-80 sm:scale-100 origin-bottom-right"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center size-5.5 sm:size-8 rounded-full bg-accent text-accent-foreground">
                  <Truck className="size-3 sm:size-4.5" />
                </span>
                <div>
                  <div className="text-[7px] sm:text-xs uppercase tracking-wide opacity-70">
                    Free delivery
                  </div>
                  <div className="text-[10px] sm:text-sm font-semibold">over $25</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
              className="absolute top-1/2 -translate-y-1/2 -left-1 sm:-left-5 size-9 sm:size-14 rounded-2xl bg-primary text-primary-foreground shadow-warm-lg flex flex-col items-center justify-center rotate-[-8deg] scale-80 sm:scale-100 origin-left"
            >
              <Flame className="size-4 sm:size-6 animate-flicker" />
              <span className="text-[6px] sm:text-[9px] font-bold uppercase mt-0.5">Hot</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="mt-auto border-y border-border/60 bg-secondary/40 py-1.5 sm:py-2 overflow-hidden w-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-6 px-3">
              {[
                "🍕 Wood-fired sourdough crust",
                "🥯 Hand-rolled pizza bagels",
                "🍔 Smashed Angus burgers",
                "🌿 Locally sourced produce",
                "🚀 25-minute delivery",
                "👨‍🍳 Chef-crafted recipes",
                "🔥 Baked fresh to order",
              ].map((item) => (
                <span
                  key={item + dup}
                  className="text-xs sm:text-sm font-medium text-foreground/70"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Hero };
