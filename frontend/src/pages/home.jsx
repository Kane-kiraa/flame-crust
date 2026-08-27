"use client";
import { Navbar } from "@/components/food/navbar";
import { Hero } from "@/components/food/hero";
import { Featured } from "@/components/food/featured";
import { Menu } from "@/components/food/menu";
import { HowItWorks } from "@/components/food/how-it-works";
import { Features } from "@/components/food/features";
import { Testimonials } from "@/components/food/testimonials";
import { Footer } from "@/components/food/footer";
import { PageTransition } from "@/components/shared/page-transition";

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Hero />
          <Featured />
          <Menu />
          <HowItWorks />
          <Features />
          <Testimonials />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
