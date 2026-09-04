"use client";
import { motion } from "framer-motion";
import { Flame, Leaf, Timer, Truck, Award, ChefHat, Sparkles } from "lucide-react";
import "./features.css";

const features = [
  {
    icon: Flame,
    title: "Wood-fired oven",
    body: "Our 800°F brick oven chars the crust in 90 seconds for that perfect leopard-spot finish and airy chew.",
    color: "bg-orange-500/10 text-orange-600" // Kept color utilities here since they are dynamic
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
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-grid">
          
          {/* Left Column: Heading, Subtitle & Live Oven Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="features-header-content"
          >
            <span className="features-badge">
              <Flame className="size-3.5" />
              Why Flame & Crust
            </span>
            <h2 className="features-title">
              We sweat the <span className="text-gradient-warm italic">little things</span> so you don't have to.
            </h2>
            <p className="features-subtitle">
              From a 48-hour dough fermentation to a smidge of hot honey on the pepperoni — every detail is intentional.
            </p>

            {/* Oven Image with Live Firing Badge */}
            <div className="features-oven-image-wrapper">
              <img
                src="/images/library/pizza3.1.jpg"
                alt="Wood-fired pizza oven at Flame & Crust"
                className="features-oven-image"
                loading="lazy"
              />
              <div className="features-oven-overlay" />
              <div className="features-oven-caption">
                <div className="features-oven-status">
                  <Flame className="animate-flicker" />
                  <span>Now firing</span>
                </div>
                <p className="features-oven-caption-text">
                  Margherita Classica, fresh out the oven
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 6 Feature Cards */}
          <div className="features-cards-grid">
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
                className="feature-card group"
              >
                <div className="feature-card-inner">
                  <span className={`feature-icon-wrapper ${f.color}`}>
                    <f.icon />
                  </span>
                  <h3 className="feature-card-title">
                    {f.title}
                  </h3>
                  <p className="feature-card-body">
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
