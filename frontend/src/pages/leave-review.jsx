import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { PageTransition } from "@/components/shared/page-transition";
import { getProducts, create } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LeaveReviewPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(data => {
        const items = Array.isArray(data) ? data : data.products || [];
        const found = items.find(i => String(i.id) === String(productId));
        if (found) setProduct(found);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setSubmitting(true);
    try {
      await create("reviews", {
        product_id: Number(productId),
        customer_id: 1, // Mock customer ID for now until Auth is fully implemented
        rating,
        comment: comment.trim() || null,
      });
      toast.success("Thank you! Your review has been submitted.");
      navigate(`/menu/${productId}`);
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader2 className="animate-spin text-primary size-8" /></div>;
  if (!product) return <div className="min-h-screen bg-background flex justify-center items-center text-muted-foreground">Product not found.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-28">
        <PageTransition>
          <div className="mx-auto max-w-2xl px-4 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 rounded-full text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>

            <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-10 shadow-warm-lg">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
                Review {product.name}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                How did you like this item? Let us know!
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 p-1"
                      >
                        <Star
                          className={cn(
                            "size-10 sm:size-12",
                            (hoverRating || rating) >= star
                              ? "fill-accent text-accent"
                              : "text-border"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {rating === 0 ? "Select rating" : `${rating} out of 5 stars`}
                  </span>
                </div>

                <div className="space-y-2 pt-4">
                  <label htmlFor="comment" className="text-sm font-medium text-foreground">
                    Add a written review (optional)
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you think about the taste and quality?"
                    className="min-h-32 rounded-xl border-border/60"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : "Submit Review"}
                </Button>
              </form>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
