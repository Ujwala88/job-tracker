import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency ?? "USD", maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return "—";
}

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  wishlist:     { label: "Wishlist",     color: "bg-slate-100 text-slate-600" },
  applied:      { label: "Applied",      color: "bg-blue-100 text-blue-700" },
  screening:    { label: "Screening",    color: "bg-sky-100 text-sky-700" },
  phone_screen: { label: "Phone Screen", color: "bg-cyan-100 text-cyan-700" },
  interview:    { label: "Interview",    color: "bg-violet-100 text-violet-700" },
  technical:    { label: "Technical",    color: "bg-indigo-100 text-indigo-700" },
  final_round:  { label: "Final Round",  color: "bg-purple-100 text-purple-700" },
  offer:        { label: "Offer",        color: "bg-emerald-100 text-emerald-700" },
  negotiating:  { label: "Negotiating",  color: "bg-amber-100 text-amber-700" },
  accepted:     { label: "Accepted",     color: "bg-green-100 text-green-700" },
  rejected:     { label: "Rejected",     color: "bg-red-100 text-red-600" },
  withdrawn:    { label: "Withdrawn",    color: "bg-gray-100 text-gray-500" },
  ghosted:      { label: "Ghosted",      color: "bg-stone-100 text-stone-500" },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "bg-slate-100 text-slate-500" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export function safeParseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
