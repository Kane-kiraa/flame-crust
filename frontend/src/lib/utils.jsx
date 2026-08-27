import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatDate(dateInput) {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).format(date);
  } catch(e) {
    return "";
  }
}

function formatPrice(amount) {
  const num = Number(amount || 0);
  return `$${num.toFixed(2)}`;
}

export {
  cn,
  formatDate,
  formatPrice
};
