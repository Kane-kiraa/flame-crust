"use client";
import { motion } from "framer-motion";
import { Flame, Leaf, Timer, Truck, Award, ChefHat, Sparkles } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Wood-fired oven",
    body: "Our 800°F brick oven chars the crust in 90 seconds for that perfect leopard-spot finish and airy chew.",
    color: "bg-orange-500/10 text-orange-600"
  },
  {
    icon: Leaf,
    title: "Locally sourced",
    body: "Produce from regional farms, mozzarella from a 3rd-generation cheesemaker, no artificial ingredients.",
    color: "bg-green-500/10 text-green-600"
  },
  {
    icon: Timer,
    title: "Made to order",
    body: "Nothing pre-cooked, nothing reheated. Your pizza hits the oven the moment you tap place order.",
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    icon: Truck,
    title: "25-min delivery",
    body: "Insulated hot-bags and live GPS tracking. If it's late, your next order is on us — that's a promise.",
    color: "bg-rose-500/10 text-rose-600"
  },
  {
    icon: ChefHat,
    title: "Chef-crafted",
    body: "Recipes by award-winning chefs. We spent 2 years dialing in the dough. You'll taste the difference.",
    color: "bg-purple-500/10 text-purple-600"
  },
  {
    icon: Award,
    title: "Best in town",
    body: "Voted #1 pizzeria by City Eats three years running. We're just getting warmed up.",
    color: "bg-blue-500/10 text-blue-600"
  }
];

export function Features() {
  return (
    <section id="features" className="pt-6 pb-12 sm:pt-14 sm:pb-20 relative overflow-hidden bg-background text-foreground">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Heading, Subtitle & Live Oven Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-24"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Flame className="size-3.5" />
              Why Flame & Crust
            </span>
            <h2 className="mt-2.5 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
              We sweat the <span className="text-gradient-warm italic">little things</span> so you don't have to.
            </h2>
            <p className="mt-2 text-xs sm:text-base text-muted-foreground max-w-md leading-relaxed">
              From a 48-hour dough fermentation to a smidge of hot honey on the pepperoni — every detail is intentional.
            </p>

            {/* Oven Image with Live Firing Badge */}
            <div className="mt-4 sm:mt-6 relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[4/3] shadow-warm-lg ring-1 ring-border/60">
              <img
                src="/images/library/pizza3.1.jpg"
                alt="Wood-fired pizza oven at Flame & Crust"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                <div className="flex items-center gap-1.5 text-white">
                  <Flame className="size-4 text-amber-500 animate-flicker" />
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-90">Now firing</span>
                </div>
                <p className="mt-0.5 font-serif text-sm sm:text-lg font-semibold text-white">
                  Margherita Classica, fresh out the oven
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 6 Feature Cards (2-Col on Mobile & Desktop) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(i * 0.08, 0.35),
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="group relative rounded-2xl bg-card border border-border/70 p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-warm flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-flex items-center justify-center size-8 sm:size-10 rounded-xl ${f.color} mb-2`}>
                    <f.icon className="size-4 sm:size-5" />
                  </span>
                  <h3 className="font-serif text-sm sm:text-lg font-bold text-foreground leading-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
