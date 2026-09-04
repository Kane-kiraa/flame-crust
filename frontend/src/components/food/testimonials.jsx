"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Heart, CheckCircle2 } from "lucide-react";
import { list } from "@/lib/api";

const DEFAULT_TESTIMONIALS = [
  {
    name: "Chantha Khemara",
    role: "Verified Customer",
    initials: "CK",
    avatar: "https://res.cloudinary.com/gdkctwwo/image/upload/v1787833850/sn9trvzopyumdrlxqkl2.jpg",
    rating: 5,
    body: "Burger សាច់ Angus ពីរជាន់ juicy ខ្លាំង! Caramelized onion និង bacon jam ធ្វើឱ្យរសជាតិដាច់គេតែម្តង។ 10/10 ត្រូវចិត្តខ្លាំង!",
    color: "bg-amber-500"
  },
  {
    name: "Sokleng",
    role: "Verified Foodie",
    initials: "SL",
    avatar: "https://res.cloudinary.com/gdkctwwo/image/upload/v1787834892/ctkcvof8bskcurmrrryu.jpg",
    rating: 5,
    body: "ឈីសច្រើន pepperoni ស្រួយឆ្ងាញ់ ដឹកមកដល់នៅក្តៅហុយៗ។ Recommend សម្រាប់អ្នកចូលចិត្តរសជាតិបែប American-Italian!",
    color: "bg-rose-500"
  },
  {
    name: "Khemara",
    role: "Regular Customer",
    initials: "KM",
    avatar: "https://res.cloudinary.com/gdkctwwo/image/upload/v1788378288/isqcmoousnfzttu3bimz.jpg",
    rating: 5,
    body: "Pizza Bagel នេះប្លែកហើយឆ្ងាញ់ណាស់! Bagel ខាងក្រៅស្រួយ ខាងក្នុងទន់ ឈីសពេញៗមាត់។ កូនៗខ្ញុំចូលចិត្តខ្លាំង។",
    color: "bg-emerald-500"
  },
  {
    name: "Khen Chet",
    role: "Verified Buyer",
    initials: "KC",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocJH3fTCAuRs8dcJYJuoy3PtVLRXgOAlVNWEQVJP8EzRf-AmrJYa=s96-c",
    rating: 5,
    body: "The authentic Neapolitan taste in town! Crust is airy, chewy, and light with perfectly balanced tomato sauce. Best pizza in Phnom Penh!",
    color: "bg-purple-500"
  },
  {
    name: "Srey Leak",
    role: "Weekly Regular",
    initials: "SL",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocK0urhPkTM23sGDETFZ8yhhfe--YZst2CP9QTcjSCfAHUpzmBQ=s96-c",
    rating: 5,
    body: "ភីហ្សាឆ្ងាញ់ ក្តៅៗស្រួយល្អ សេវាកម្មដឹកជញ្ជូនរហ័សទាន់ចិត្ត គ្រាន់តែបើកប្រអប់ភ្លាមឈ្ងុយសាយភាយពេញផ្ទះ!",
    color: "bg-blue-500"
  },
  {
    name: "Khemara (kira)",
    role: "Food Blogger",
    initials: "KK",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocLd9RuuN9RwU2tZa9lL0iI10bL5Z3xAIAKCXcpH30PVL8iw5A=s96-c",
    rating: 5,
    body: "ដំឡូងបារាំងបំពងក្លិន Truffle ឈ្ងុយសាយភាយ ជាមួយ Parmesan ម៉ត់ និង garlic aioli dip ឆ្ងាញ់ញៀនជាប់ចិត្ត!",
    color: "bg-orange-500"
  }
];

export function Testimonials() {
  const [items, setItems] = useState(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    let isMounted = true;
    async function loadRealReviews() {
      try {
        const [reviewsRes, customersRes] = await Promise.allSettled([
          list("reviews"),
          list("customers")
        ]);

        const allReviews = reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value) ? reviewsRes.value : [];
        const allCustomers = customersRes.status === "fulfilled" && Array.isArray(customersRes.value) ? customersRes.value : [];

        if (allReviews.length > 0 && isMounted) {
          const formatted = allReviews
            .filter(r => r.comment && r.comment.length > 20)
            .slice(0, 6)
            .map((r, idx) => {
              const cust = allCustomers.find(c => String(c.id) === String(r.customer_id));
              const name = r.customer_name || cust?.name || DEFAULT_TESTIMONIALS[idx % DEFAULT_TESTIMONIALS.length].name;
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "FC";
              const avatar = cust?.avatar || null;

              return {
                name,
                role: r.is_verified_purchase ? "Verified Customer" : (DEFAULT_TESTIMONIALS[idx % DEFAULT_TESTIMONIALS.length]?.role || "Food Lover"),
                initials,
                avatar,
                rating: r.rating || 5,
                body: r.comment,
                color: DEFAULT_TESTIMONIALS[idx % DEFAULT_TESTIMONIALS.length]?.color || "bg-primary"
              };
            });

          if (formatted.length >= 3) {
            setItems(formatted);
          }
        }
      } catch (e) {
        // keep default testimonials
      }
    }
    loadRealReviews();
    return () => { isMounted = false; };
  }, []);

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
          {items.map((t, i) => (
            <motion.figure
              key={t.name + i}
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
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="size-9 rounded-full object-cover shrink-0 ring-1 ring-border shadow-xs"
                  />
                ) : (
                  <span className={`flex items-center justify-center size-9 rounded-full ${t.color} text-white font-bold text-xs shrink-0 shadow-xs`}>
                    {t.initials}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-foreground truncate flex items-center gap-1">
                    {t.name}
                    {t.role?.includes("Verified") && (
                      <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                    )}
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

