"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Navbar } from "@/components/food/navbar";
import { Hero } from "@/components/food/hero";
import { Featured } from "@/components/food/featured";
import { Menu } from "@/components/food/menu";
import { HowItWorks } from "@/components/food/how-it-works";
import { Features } from "@/components/food/features";
import { Testimonials } from "@/components/food/testimonials";
import { Footer } from "@/components/food/footer";
function Home() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "flex-1", children: [
      /* @__PURE__ */ jsx(Hero, {}),
      /* @__PURE__ */ jsx(Featured, {}),
      /* @__PURE__ */ jsx(Menu, {}),
      /* @__PURE__ */ jsx(HowItWorks, {}),
      /* @__PURE__ */ jsx(Features, {}),
      /* @__PURE__ */ jsx(Testimonials, {})
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Home as default
};
