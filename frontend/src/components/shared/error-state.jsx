import { jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className || ""}`}>
      <div className="flex items-center justify-center size-16 rounded-full bg-destructive/10 mb-5">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
