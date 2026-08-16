import { useState, useEffect } from "react";
import { Ticket, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { list } from "@/lib/api";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AvailableCoupons({ onSelectCoupon }) {
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
      const activeCoupons = data.filter(c => 
        c.active && (!c.expires_at || new Date(c.expires_at) > new Date())
      );
      setCoupons(activeCoupons);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (code) => {
    onSelectCoupon(code);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1.5 mt-3">
          <Ticket className="size-3.5" /> View Available Coupons
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <DialogTitle className="font-serif text-xl">Available Coupons</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length > 0 ? (
            <ScrollArea className="h-[350px]">
              <div className="p-6 space-y-3">
                {coupons.map((coupon) => (
                  <div 
                    key={coupon.id} 
                    className="group border border-border/60 bg-card rounded-2xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer hover:shadow-sm"
                    onClick={() => handleSelect(coupon.code)}
                  >
                    <div>
                      <h4 className="font-bold text-foreground flex items-center gap-2 text-base">
                        <span className="flex size-7 rounded-full bg-primary/10 items-center justify-center">
                          <Ticket className="size-3.5 text-primary" />
                        </span>
                        {coupon.code}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">
                        {coupon.discount_type === "FREE_DELIVERY" 
                          ? "Free Delivery on your order!" 
                          : coupon.discount_type === "PERCENTAGE" 
                            ? `${coupon.discount_value}% OFF your total`
                            : `$${coupon.discount_value} OFF your total`}
                      </p>
                      {coupon.min_order_amount > 0 && (
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          Min. order: ${coupon.min_order_amount}
                        </p>
                      )}
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      Apply
                    </Button>
                  </div>
                ))}
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
