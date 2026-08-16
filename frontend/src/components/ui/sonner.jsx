"use client";
import { useTheme } from "@/components/theme-provider.jsx";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:pr-10 group-[.toaster]:font-sans group-[.toaster]:backdrop-blur-md transition-all",
          title: "font-semibold text-sm leading-snug",
          description: "group-[.toast]:text-muted-foreground text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

