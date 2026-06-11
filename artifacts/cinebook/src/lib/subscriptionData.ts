// ─── Subscription & Payment Data Layer ────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;           // monthly price in ₹
  annualPrice: number;     // annual price in ₹
  features: string[];
  maxStreams: number;
  quality: string;
  downloads: boolean;
  recommended?: boolean;
}

export interface UserSubscription {
  planId: string;
  status: "active" | "cancelled" | "expired" | "paused";
  startDate: string;
  endDate: string;
  billingCycle: "monthly" | "annual";
  autoRenew: boolean;
  cancelledAt?: string;
}

export interface PaymentRecord {
  id: string;
  type: "subscription" | "ticket" | "refund";
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending" | "refunded";
  method: "upi" | "card" | "wallet" | "netbanking";
  transactionId: string;
  description: string;
  planId?: string;
  timestamp: string;
  upiId?: string;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 149,
    annualPrice: 1499,
    features: [
      "Watch on 1 device",
      "SD quality streaming",
      "5 movies per month",
      "No downloads",
    ],
    maxStreams: 1,
    quality: "SD",
    downloads: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 299,
    annualPrice: 2999,
    features: [
      "Watch on 2 devices",
      "Full HD streaming",
      "Unlimited movies",
      "10 downloads/month",
      "Early access to new releases",
    ],
    maxStreams: 2,
    quality: "Full HD",
    downloads: true,
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 499,
    annualPrice: 4999,
    features: [
      "Watch on 4 devices",
      "4K + HDR streaming",
      "Unlimited movies",
      "Unlimited downloads",
      "Early access to new releases",
      "Skip ads on trailers",
      "Exclusive behind-the-scenes",
    ],
    maxStreams: 4,
    quality: "4K + HDR",
    downloads: true,
  },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const SUBSCRIPTION_KEY = "mk_subscription";
const PAYMENTS_KEY = "mk_payments";
const WATCH_HISTORY_KEY = "mk_watch_history";

// ─── Subscription CRUD ────────────────────────────────────────────────────────

export const getSubscription = (): UserSubscription | null => {
  try {
    const sub = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || "null");
    if (!sub) return null;
    // Auto-expire
    if (new Date(sub.endDate) < new Date() && sub.status === "active") {
      sub.status = "expired";
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
    }
    return sub;
  } catch {
    return null;
  }
};

export const subscribe = (
  planId: string,
  billingCycle: "monthly" | "annual" = "monthly"
): UserSubscription => {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error("Invalid plan");

  const now = new Date();
  const endDate = new Date(now);
  if (billingCycle === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const sub: UserSubscription = {
    planId,
    status: "active",
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    billingCycle,
    autoRenew: true,
  };

  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return sub;
};

export const cancelSubscription = (): UserSubscription | null => {
  const sub = getSubscription();
  if (!sub) return null;
  sub.status = "cancelled";
  sub.autoRenew = false;
  sub.cancelledAt = new Date().toISOString();
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return sub;
};

export const toggleAutoRenew = (): UserSubscription | null => {
  const sub = getSubscription();
  if (!sub) return null;
  sub.autoRenew = !sub.autoRenew;
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return sub;
};

export const isSubscribed = (): boolean => {
  const sub = getSubscription();
  if (!sub) return false;
  if (sub.status === "active") return true;
  if (sub.status === "cancelled" && new Date(sub.endDate) > new Date()) return true;
  return false;
};

export const getCurrentPlan = (): SubscriptionPlan | null => {
  const sub = getSubscription();
  if (!sub || !isSubscribed()) return null;
  return SUBSCRIPTION_PLANS.find((p) => p.id === sub.planId) || null;
};

// ─── Payment History ──────────────────────────────────────────────────────────

export const getPaymentHistory = (): PaymentRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const addPayment = (
  payment: Omit<PaymentRecord, "id" | "timestamp">
): PaymentRecord => {
  const payments = getPaymentHistory();
  const record: PaymentRecord = {
    ...payment,
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  payments.unshift(record);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  return record;
};

export const getTotalSpent = (): number => {
  return getPaymentHistory()
    .filter((p) => p.status === "success" && p.type !== "refund")
    .reduce((sum, p) => sum + p.amount, 0);
};

// ─── Watch History ────────────────────────────────────────────────────────────

export interface WatchHistoryEntry {
  movieId: string;
  movieTitle: string;
  watchedAt: string;
  duration: number; // minutes watched
  completed: boolean;
}

export const getWatchHistory = (): WatchHistoryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

export const addWatchHistory = (entry: Omit<WatchHistoryEntry, "watchedAt">): void => {
  let history = getWatchHistory();
  const existingIndex = history.findIndex(h => h.movieId === entry.movieId);
  let updatedEntry: WatchHistoryEntry = {
    ...entry,
    watchedAt: new Date().toISOString()
  };
  if (existingIndex >= 0) {
    const existing = history[existingIndex];
    updatedEntry.duration = entry.duration > 0 ? entry.duration : existing.duration;
    updatedEntry.completed = entry.completed || existing.completed;
    history.splice(existingIndex, 1);
  }
  history.unshift(updatedEntry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
};

export const updateWatchHistory = (movieId: string, duration: number, completed: boolean): void => {
  let history = getWatchHistory();
  const existing = history.find(h => h.movieId === movieId);
  if (existing) {
    existing.duration = duration;
    existing.completed = completed || existing.completed;
    existing.watchedAt = new Date().toISOString();
    const filtered = history.filter(h => h.movieId !== movieId);
    filtered.unshift(existing);
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filtered));
  }
};

// ─── Admin Subscription Stats ─────────────────────────────────────────────────

export const getSubscriptionStats = () => {
  const payments = getPaymentHistory();
  const subPayments = payments.filter(
    (p) => p.type === "subscription" && p.status === "success"
  );
  return {
    totalSubscriptionRevenue: subPayments.reduce((s, p) => s + p.amount, 0),
    totalSubscribers: subPayments.length,
    activeSubscriptions: getSubscription()?.status === "active" ? 1 : 0,
  };
};
