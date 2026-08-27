"use client";
import { motion } from "framer-motion";
import { Star, Quote, Heart } from "lucide-react";

const testimonials = [
  {
    name: "Sarah K.",
    role: "Verified Customer",
    initials: "SK",
    rating: 5,
    body: "I've ordered the Margherita Classica four times this month. The crust is the best I've had outside of Naples — airy, slightly charred, and delivered hot every single time.",
    color: "bg-rose-500"
  },
  {
    name: "Marcus T.",
    role: "Burger Devotee",
    initials: "MT",
    rating: 5,
    body: "The Flame & Crust Signature burger ruined every other burger for me. The bacon jam is criminally good and the patties are juicy without being greasy.",
    color: "bg-amber-500"
  },
  {
    name: "Priya R.",
    role: "Pizza Bagel Fan",
    initials: "PR",
    rating: 5,
    body: "Didn't know pizza bagels could be this good. The everything-bagel crust is genius. Ordered a tray for a party and they disappeared in five minutes flat.",
    color: "bg-emerald-500"
  },
  {
    name: "David L.",
    role: "Weekly Regular",
    initials: "DL",
    rating: 5,
    body: "Consistently excellent. I order every Friday night for family movie night and the kids love it every time the box opens. The garlic knots are a must-order.",
    color: "bg-purple-500"
  },
  {
    name: "Jenna M.",
    role: "Food Blogger",
    initials: "JM",
    rating: 5,
    body: "Reviewed 40+ pizzerias this year — Flame & Crust is in my top three. The four-cheese with truffle honey is a religious experience. Highly recommend.",
    color: "bg-blue-500"
  },
  {
    name: "Tom H.",
    role: "Office Team Lead",
    initials: "TH",
    rating: 5,
    body: "Ordered 12 pizzas for a team lunch — arrived hot, on time, and everyone asked where it was from. The online ordering flow was the easiest I've used.",
    color: "bg-orange-500"
  }
];

export function Testimonials() {
  return (
    <section className="pt-6 pb-14 sm:pt-14 sm:pb-24 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Heart className="size-3.5 fill-primary text-primary" />
            Loved by 30k+ foodies
          </span>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Don't take our <span className="text-gradient-warm italic">word for it.</span>
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <span className="font-bold text-xs sm:text-sm text-foreground">4.9 / 5</span>
            <span className="text-xs text-muted-foreground">· 12,400+ reviews</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-6 sm:mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                delay: Math.min(i * 0.08, 0.35),
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative rounded-2xl sm:rounded-3xl bg-card border border-border/70 shadow-warm hover:shadow-warm-lg transition-all p-4 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <Quote className="size-6 text-primary/20 mb-2" />
                <blockquote className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                  "{t.body}"
                </blockquote>
              </div>

              <figcaption className="mt-4 flex items-center gap-2.5 pt-3.5 border-t border-border/40">
                <span className={`flex items-center justify-center size-9 rounded-full ${t.color} text-white font-bold text-xs shrink-0 shadow-xs`}>
                  {t.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {t.role}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="size-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

      </div>
    </section>
  );
}
