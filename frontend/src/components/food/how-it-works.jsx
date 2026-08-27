"use client";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Bike, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Pick your favorites",
    body: "Browse artisan wood-fired pizzas, bagels, and burgers crafted with fresh sourdough and premium ingredients."
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "Build your order",
    body: "Customize toppings, apply coupons, and checkout in seconds with Bakong KHQR or Cash on Delivery."
  },
  {
    icon: Bike,
    step: "03",
    title: "We fire it up & deliver",
    body: "Baked fresh to order in a blazing wood oven and delivered hot to your doorstep in 25–35 minutes."
  }
];

export function HowItWorks() {
  return (
    <section className="pt-6 pb-12 sm:pt-14 sm:pb-20 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            How it works
          </span>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Three taps and <span className="text-gradient-warm italic">you're feasting.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-base text-muted-foreground max-w-md mx-auto">
            From our blazing oven straight to your doorstep — fast, effortless, and piping hot.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-8 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 relative">
          {/* Connecting Line on Desktop */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative text-center p-4 sm:p-6 rounded-2xl bg-card/60 sm:bg-transparent border border-border/40 sm:border-0"
            >
              {/* Step Icon & Number Badge */}
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                <span className="flex items-center justify-center size-16 sm:size-20 rounded-2xl bg-card border border-border/70 shadow-warm">
                  <s.icon className="size-7 sm:size-9 text-primary" strokeWidth={1.8} />
                </span>
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-7 sm:size-8 rounded-full bg-amber-500 text-slate-950 font-serif text-xs sm:text-sm font-bold border-2 border-background shadow-xs">
                  {s.step}
                </span>
              </div>

              <h3 className="font-serif text-lg sm:text-2xl font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
