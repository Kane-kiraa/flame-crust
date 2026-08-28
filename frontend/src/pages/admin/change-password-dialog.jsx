import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, KeyRound, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "", textColor: "" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak (ខ្សោយ)", color: "bg-red-500", textColor: "text-red-500" };
  if (score === 2) return { score: 2, label: "Medium (មធ្យម)", color: "bg-amber-500", textColor: "text-amber-500" };
  if (score === 3) return { score: 3, label: "Good (ល្អ)", color: "bg-blue-500", textColor: "text-blue-500" };
  return { score: 4, label: "Strong (ខ្លាំង & សុវត្ថិភាព)", color: "bg-emerald-500", textColor: "text-emerald-500" };
}

export default function AdminChangePasswordDialog({ open, onOpenChange }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adminAuth = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminAuth") || "null");
    } catch {
      return null;
    }
  })();

  const adminEmail = adminAuth?.email || "admin@flamecrust.com";
  const strength = getPasswordStrength(newPassword);

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleClose = (isOpen) => {
    if (!loading) {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!oldPassword.trim()) {
      setError("សូមបញ្ចូលលេខសម្ងាត់ចាស់ (Current Password is required)");
      return;
    }

    if (!newPassword.trim()) {
      setError("សូមបញ្ចូលលេខសម្ងាត់ថ្មី (New Password is required)");
      return;
    }

    if (newPassword.length < 6) {
      setError("លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ (Minimum 6 characters)");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("លេខសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ (Passwords do not match)");
      return;
    }

    if (oldPassword === newPassword) {
      setError("លេខសម្ងាត់ថ្មីមិនត្រូវដូចលេខសម្ងាត់ចាស់ទេ (New password cannot be same as old)");
      return;
    }

    setLoading(true);
    try {
      const token = adminAuth?.token;
      const res = await fetch(`${API_URL}/auth/admin-change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: adminEmail,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "មិនអាចប្តូរលេខសម្ងាត់បានទេ");
      }

      toast.success("លេខសម្ងាត់ Admin ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ! 🎉", {
        description: "Admin password has been updated successfully.",
      });

      handleClose(false);
    } catch (err) {
      setError(err.message || "មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់");
      toast.error(err.message || "មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl border-border/80 bg-card shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-2">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center shadow-lg shadow-primary/20 mb-1">
            <KeyRound className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground font-serif">
            ប្តូរលេខសម្ងាត់ Admin
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            ផ្លាស់ប្តូរលេខសម្ងាត់សុវត្ថិភាពសម្រាប់គណនី{" "}
            <span className="font-semibold text-foreground underline underline-offset-2">
              {adminEmail}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2 animate-shake">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">
              លេខសម្ងាត់បច្ចុប្បន្ន (Current Password) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                className="pl-10 pr-10 rounded-xl h-11 border-border/80 focus:border-primary text-sm"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
              >
                {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">
              លេខសម្ងាត់ថ្មី (New Password) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="យ៉ាងហោចណាស់ ៦ តួអក្សរ"
                className="pl-10 pr-10 rounded-xl h-11 border-border/80 focus:border-primary text-sm"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex gap-1 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      strength.color,
                      strength.score === 1 && "w-1/4",
                      strength.score === 2 && "w-2/4",
                      strength.score === 3 && "w-3/4",
                      strength.score === 4 && "w-full"
                    )}
                  />
                </div>
                <p className={cn("text-[11px] font-medium text-right", strength.textColor)}>
                  កម្រិតសុវត្ថិភាព: {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">
              បញ្ជាក់លេខសម្ងាត់ថ្មី (Confirm Password) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="វាយលេខសម្ងាត់ថ្មីម្តងទៀត"
                className="pl-10 pr-10 rounded-xl h-11 border-border/80 focus:border-primary text-sm"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3" /> លេខសម្ងាត់ផ្ទៀងផ្ទាត់ត្រឹមត្រូវ
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
              className="rounded-xl border-border/80 text-xs font-semibold h-10 px-4"
            >
              បោះបង់ (Cancel)
            </Button>
            <Button
              type="submit"
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-10 px-5 shadow-md shadow-primary/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : (
                "រក្សាទុកលេខសម្ងាត់ថ្មី"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
