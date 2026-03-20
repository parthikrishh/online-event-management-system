import { useEffect, useMemo, useState } from "react";

const jsonHeaders = {
  "Content-Type": "application/json",
};

const PROD_FALLBACK_API_BASE_URL = "https://online-event-management-system-134k.onrender.com";
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (
  rawApiBaseUrl
  || (import.meta.env.DEV ? "" : PROD_FALLBACK_API_BASE_URL)
).replace(/\/$/, "");
let streamInitialized = false;

const toUrl = (url) => {
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

async function request(url, options = {}) {
  const response = await fetch(toUrl(url), options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export function initializeRealtimeUpdates() {
  if (streamInitialized || typeof window === "undefined" || typeof EventSource === "undefined") {
    return;
  }

  streamInitialized = true;
  const stream = new EventSource(toUrl("/api/stream"));

  stream.onmessage = () => {
    window.dispatchEvent(new Event("oems:data-updated"));
  };

  stream.onerror = () => {
    // The browser auto-reconnects for EventSource; keep this silent.
  };
}

export const api = {
  users: {
    list: async () => request("/api/users"),
    getByEmail: async ({ email }) => request(`/api/users/by-email?email=${encodeURIComponent(email)}`),
    create: async (payload) =>
      request("/api/users", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    update: async ({ id, updates }) =>
      request(`/api/users/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ updates }),
      }),
    remove: async ({ id }) =>
      request(`/api/users/${id}`, {
        method: "DELETE",
      }),
  },
  events: {
    list: async () => request("/api/events"),
    save: async (eventToSave) =>
      request("/api/events", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(eventToSave),
      }),
    remove: async ({ id }) =>
      request(`/api/events/${id}`, {
        method: "DELETE",
      }),
    seed: async () =>
      request("/api/seed", {
        method: "POST",
      }),
    cancelAndRefund: async ({ id, reason }) =>
      request(`/api/events/${id}/cancel-refund`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ reason }),
      }),
  },
  bookings: {
    listAll: async () => request("/api/bookings"),
    listByUser: async ({ userId }) => request(`/api/bookings/user/${encodeURIComponent(userId)}`),
    getBookedSeats: async ({ eventId }) => request(`/api/bookings/event/${encodeURIComponent(eventId)}/seats`),
    secureBook: async (payload) =>
      request("/api/bookings", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    processRefund: async ({ bookingId, isApproved }) =>
      request(`/api/bookings/${bookingId}/refund`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ isApproved }),
      }),
    remove: async ({ id }) =>
      request(`/api/bookings/${id}`, {
        method: "DELETE",
      }),
    listRefunds: async () => request("/api/refunds"),
    removeRefund: async ({ id }) =>
      request(`/api/refunds/${id}`, {
        method: "DELETE",
      }),
    checkIn: async ({ billId, eventId }) =>
      request("/api/bookings/check-in", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ billId, eventId }),
      }),
    revertCheckIn: async ({ id }) =>
      request(`/api/bookings/${id}/revert-check-in`, {
        method: "POST",
      }),
  },
  misc: {
    listReviews: async () => request("/api/reviews"),
    addReview: async (payload) =>
      request("/api/reviews", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    removeReview: async ({ id }) =>
      request(`/api/reviews/${id}`, {
        method: "DELETE",
      }),
    listLogs: async () => request("/api/logs"),
    addLog: async ({ action, details }) =>
      request("/api/logs", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ action, details }),
      }),
  },
};

const execute = async (fn, args) => {
  if (typeof fn !== "function") return undefined;
  if (args === undefined) return fn();
  return fn(args);
};

export function useQuery(fn, args) {
  const { data } = useQueryState(fn, args);
  return data;
}

export function useQueryState(fn, args) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const argsKey = useMemo(() => JSON.stringify(args), [args]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (args === "skip") {
        if (!cancelled) {
          setData(undefined);
          setLoading(false);
          setError(null);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await execute(fn, args);
        if (!cancelled) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setData(undefined);
          setLoading(false);
          setError(err);
        }
      }
    };

    load();

    const refresh = () => setRefreshTick((v) => v + 1);
    window.addEventListener("oems:data-updated", refresh);

    return () => {
      cancelled = true;
      window.removeEventListener("oems:data-updated", refresh);
    };
  }, [fn, args, argsKey, refreshTick]);

  return { data, loading, error };
}

export function useMutation(fn) {
  return async (args) => {
    const result = await execute(fn, args);
    window.dispatchEvent(new Event("oems:data-updated"));
    return result;
  };
}
