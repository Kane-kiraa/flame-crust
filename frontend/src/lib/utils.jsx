import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatDate(dateInput) {
  if (!dateInput) return "";
  try {
    let formattedInput = dateInput;
    if (typeof dateInput === "string") {
      formattedInput = dateInput.replace(" ", "T");
    }
    const date = new Date(formattedInput);
    if (isNaN(date.getTime())) return "";
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

function formatTime(dateInput) {
  if (!dateInput) return "";
  try {
    let formattedInput = dateInput;
    if (typeof dateInput === "string") {
      formattedInput = dateInput.replace(" ", "T");
    }
    const date = new Date(formattedInput);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat('en-US', { 
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
  formatTime,
  formatPrice
};
