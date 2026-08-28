import { useState, useEffect } from "react";
import { Ticket, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { list } from "@/lib/api";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AvailableCoupons({ onSelectCoupon, subtotal = 0 }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && coupons.length === 0) {
      loadCoupons();
    }
  }, [open, coupons.length]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await list("coupons");
      // Filter out completely inactive ones, but show active ones even if min_order or expiration is checked dynamically
      const activeCoupons = data.filter(c => c.active);
      setCoupons(activeCoupons);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (coupon) => {
    onSelectCoupon(coupon);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1.5 mt-3">
          <Ticket className="size-3.5" /> View Available Coupons
        </button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background rounded-3xl border border-border/80">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
          <DialogTitle className="font-serif text-lg sm:text-xl">Available Coupons</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a coupon code or voucher to apply discount.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length > 0 ? (
            <ScrollArea className="h-[360px]">
              <div className="p-3.5 sm:p-5 space-y-2.5">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) <= new Date();
                  const minOrder = Number(coupon.min_order_amount || 0);
                  const isMinOrderNotMet = subtotal > 0 && minOrder > 0 && subtotal < minOrder;
                  const isDisabled = isExpired || isMinOrderNotMet;

                  return (
                    <div 
                      key={coupon.id} 
                      className={`group border rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2 transition-colors ${
                        isDisabled 
                          ? "border-border/40 bg-muted/20 opacity-75 cursor-not-allowed" 
                          : "border-border/60 bg-card hover:border-primary/50 cursor-pointer hover:shadow-xs"
                      }`}
                      onClick={() => {
                        if (isExpired) {
                          toast.error("This coupon has expired.");
                          return;
                        }
                        if (isMinOrderNotMet) {
                          toast.error(`Order subtotal ($${subtotal.toFixed(2)}) must be at least $${minOrder.toFixed(2)} to use this coupon.`);
                          return;
                        }
                        handleSelect(coupon);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="flex size-6 sm:size-7 rounded-full bg-primary/10 items-center justify-center shrink-0">
                            <Ticket className="size-3 sm:size-3.5 text-primary" />
                          </span>
                          <span className="font-bold text-foreground text-sm sm:text-base truncate">{coupon.code}</span>
                          {isExpired && (
                            <span className="text-[9px] sm:text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-semibold shrink-0">Expired</span>
                          )}
                          {isMinOrderNotMet && !isExpired && (
                            <span className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">Min ${minOrder}</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium leading-tight">
                          {coupon.discount_type === "FREE_DELIVERY" 
                            ? "Free Delivery on your order!" 
                            : coupon.discount_type === "PERCENTAGE" 
                              ? `${coupon.discount_value}% OFF your total`
                              : `$${coupon.discount_value} OFF your total`}
                        </p>
                        {minOrder > 0 && (
                          <p className={`text-[10px] sm:text-[11px] mt-1 ${isMinOrderNotMet ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-muted-foreground/70"}`}>
                            Min. order: ${minOrder} {isMinOrderNotMet && `(Need $${(minOrder - subtotal).toFixed(2)} more)`}
                          </p>
                        )}
                      </div>
                      <Button 
                        type="button"
                        variant={isDisabled ? "outline" : "secondary"} 
                        size="sm" 
                        disabled={isDisabled}
                        className={`rounded-full shrink-0 h-7 sm:h-8 text-xs px-2.5 sm:px-3.5 ${!isDisabled ? "group-hover:bg-primary group-hover:text-primary-foreground" : ""} transition-colors`}
                      >
                        {isDisabled ? "Unavailable" : "Apply"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No active coupons available right now.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
