import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "data", "db.json");

const app = express();
const PORT = Number(process.env.PORT || 4000);
const sseClients = new Set();
const FRONTEND_URL = process.env.FRONTEND_URL || "";

app.use(cors());
app.use(express.json());

const pushRealtimeUpdate = () => {
  const payload = `data: ${JSON.stringify({ type: "data-updated", at: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
};

const readDb = async () => {
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw);
};

const writeDb = async (db) => {
  await fs.writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  pushRealtimeUpdate();
};

const now = () => new Date().toISOString();
const roundInr = (value) => Math.round(Number(value || 0));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const sanitizePromoCode = (promo) => ({
  id: promo.id || `promo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  code: String(promo.code || "").trim().toUpperCase(),
  description: String(promo.description || "").trim(),
  discountType: promo.discountType === "flat" ? "flat" : "percentage",
  discountValue: Number(promo.discountValue || 0),
  minOrderAmount: Number(promo.minOrderAmount || 0),
  usageLimit: Number.isFinite(Number(promo.usageLimit)) ? Number(promo.usageLimit) : null,
  usedCount: Number(promo.usedCount || 0),
  oncePerUser: promo.oncePerUser === true,
  active: promo.active !== false,
  expiresAt: promo.expiresAt || null,
  updatedAt: now(),
  createdAt: promo.createdAt || now(),
});

const ensureDbShape = (db) => {
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.events)) db.events = [];
  if (!Array.isArray(db.bookings)) db.bookings = [];
  if (!Array.isArray(db.refunds)) db.refunds = [];
  if (!Array.isArray(db.reviews)) db.reviews = [];
  if (!Array.isArray(db.logs)) db.logs = [];
  if (!Array.isArray(db.promoCodes)) db.promoCodes = [];
  if (!db.settings || typeof db.settings !== "object") db.settings = {};
  if (!db.settings.tax || typeof db.settings.tax !== "object") {
    db.settings.tax = { cgstRate: 9, sgstRate: 9 };
  }
};

const getTaxSettings = (db) => {
  ensureDbShape(db);
  const cgstRate = Number(db.settings?.tax?.cgstRate ?? 9);
  const sgstRate = Number(db.settings?.tax?.sgstRate ?? 9);
  return {
    cgstRate: Number.isFinite(cgstRate) ? cgstRate : 9,
    sgstRate: Number.isFinite(sgstRate) ? sgstRate : 9,
  };
};

const getEffectiveSeats = (booking) => {
  if (Array.isArray(booking.activeSeats)) return booking.activeSeats;
  if (!Array.isArray(booking.selectedSeats)) return [];
  if (!Array.isArray(booking.cancelledSeats) || booking.cancelledSeats.length === 0) return booking.selectedSeats;
  const cancelled = new Set(booking.cancelledSeats);
  return booking.selectedSeats.filter((seat) => !cancelled.has(seat));
};

const validatePromo = ({ promoCode, db, subtotal, userId }) => {
  if (!promoCode) {
    return { valid: true, discountAmount: 0, discountRate: 0, promo: null, message: "" };
  }

  const normalized = String(promoCode).trim().toUpperCase();
  const promo = (db.promoCodes || []).find((item) => item.code === normalized);
  if (!promo) {
    return { valid: false, message: "Invalid promo code.", reason: "invalid" };
  }

  if (!promo.active) {
    return { valid: false, message: "This promo code is inactive.", reason: "inactive" };
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, message: "This promo code has expired.", reason: "expired" };
  }

  if (Number.isFinite(promo.usageLimit) && promo.usedCount >= promo.usageLimit) {
    return { valid: false, message: "This promo code reached its usage limit.", reason: "limit_reached" };
  }

  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount for this code is INR ${roundInr(promo.minOrderAmount)}.`,
      reason: "minimum_amount",
    };
  }

  const hasUsed = (db.bookings || []).some((booking) => booking.userId === userId && booking.promoCode === normalized);
  if (promo.oncePerUser && hasUsed) {
    return { valid: false, message: "This promo code can only be used once per user.", reason: "already_used" };
  }

  const discountAmount = promo.discountType === "flat"
    ? Number(promo.discountValue || 0)
    : subtotal * (Number(promo.discountValue || 0) / 100);

  const safeDiscount = clamp(discountAmount, 0, subtotal);
  const discountRate = subtotal > 0 ? safeDiscount / subtotal : 0;

  return {
    valid: true,
    promo,
    discountAmount: safeDiscount,
    discountRate,
    message: `Promo applied: INR ${roundInr(safeDiscount)} off`,
  };
};

const buildSeatPriceMap = (selectedSeats, event) => {
  const map = {};
  const vipSeats = new Set(Array.isArray(event.vipSeats) ? event.vipSeats.map((seat) => String(seat).toUpperCase()) : []);
  for (const seat of selectedSeats) {
    const normalizedSeat = String(seat).toUpperCase();
    const isVip = vipSeats.has(normalizedSeat) || normalizedSeat.startsWith("A") || normalizedSeat.startsWith("B");
    map[seat] = isVip ? Number(event.vipPrice || event.price || 0) : Number(event.price || 0);
  }
  return map;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "event-api" });
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "event-api",
    message: "EventX backend is running.",
    health: "/api/health",
    stream: "/api/stream",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    service: "event-api",
    message: "API root. Use specific endpoints like /api/events, /api/users, /api/bookings.",
    endpoints: ["/api/health", "/api/events", "/api/users", "/api/bookings", "/api/stream"],
  });
});

app.get("/events", (_req, res) => {
  if (FRONTEND_URL) {
    res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/events`);
    return;
  }

  res.status(400).json({
    ok: false,
    message: "This is backend-only route space. Set FRONTEND_URL env var to enable redirect to frontend /events.",
  });
});

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: "connected", at: new Date().toISOString() })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.post("/api/seed", async (_req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  await writeDb(db);
  res.json({ success: true });
});

app.get("/api/users", async (_req, res) => {
  const db = await readDb();
  res.json(db.users || []);
});

app.get("/api/users/by-email", async (req, res) => {
  const email = String(req.query.email || "").toLowerCase();
  const db = await readDb();
  const user = (db.users || []).find((u) => String(u.email).toLowerCase() === email) || null;
  res.json(user);
});

app.post("/api/users", async (req, res) => {
  const db = await readDb();
  const payload = req.body || {};
  const inUse = (db.users || []).some((u) => String(u.email).toLowerCase() === String(payload.email || "").toLowerCase());
  if (inUse) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }
  const user = {
    ...payload,
    id: payload.id || Date.now().toString(),
    createdAt: payload.createdAt || now(),
  };
  db.users.push(user);
  await writeDb(db);
  res.status(201).json(user);
});

app.patch("/api/users/:id", async (req, res) => {
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  db.users[idx] = { ...db.users[idx], ...(req.body?.updates || {}) };
  await writeDb(db);
  res.json(db.users[idx]);
});

app.delete("/api/users/:id", async (req, res) => {
  const db = await readDb();
  const id = req.params.id;
  db.users = db.users.filter((u) => u.id !== id);
  db.bookings = db.bookings.filter((b) => b.userId !== id);
  db.reviews = db.reviews.filter((r) => r.userId !== id);
  await writeDb(db);
  res.json({ success: true });
});

app.get("/api/events", async (_req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  res.json(db.events || []);
});

app.get("/api/promo-codes", async (_req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  res.json(db.promoCodes || []);
});

app.get("/api/settings/tax", async (_req, res) => {
  const db = await readDb();
  res.json(getTaxSettings(db));
});

app.post("/api/settings/tax", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  const cgstRate = Number(req.body?.cgstRate);
  const sgstRate = Number(req.body?.sgstRate);

  if (!Number.isFinite(cgstRate) || cgstRate < 0 || cgstRate > 50 || !Number.isFinite(sgstRate) || sgstRate < 0 || sgstRate > 50) {
    res.status(400).json({ message: "CGST and SGST must be between 0 and 50." });
    return;
  }

  db.settings.tax = { cgstRate, sgstRate };
  await writeDb(db);
  res.json(db.settings.tax);
});

app.post("/api/promo-codes", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  const payload = sanitizePromoCode(req.body || {});

  if (!payload.code) {
    res.status(400).json({ message: "Promo code is required." });
    return;
  }

  if (payload.discountType === "percentage" && (payload.discountValue <= 0 || payload.discountValue > 100)) {
    res.status(400).json({ message: "Percentage discount must be between 1 and 100." });
    return;
  }

  if (payload.discountType === "flat" && payload.discountValue <= 0) {
    res.status(400).json({ message: "Flat discount must be greater than zero." });
    return;
  }

  const duplicate = db.promoCodes.find((promo) => promo.code === payload.code && promo.id !== payload.id);
  if (duplicate) {
    res.status(409).json({ message: "Promo code already exists." });
    return;
  }

  const idx = db.promoCodes.findIndex((promo) => promo.id === payload.id);
  if (idx === -1) db.promoCodes.push(payload);
  else db.promoCodes[idx] = { ...db.promoCodes[idx], ...payload, updatedAt: now() };

  await writeDb(db);
  res.json(payload);
});

app.delete("/api/promo-codes/:id", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  db.promoCodes = db.promoCodes.filter((promo) => promo.id !== req.params.id);
  await writeDb(db);
  res.json({ success: true });
});

app.post("/api/promo-codes/validate", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);

  const promoCode = String(req.body?.code || "").trim().toUpperCase();
  const subtotal = Number(req.body?.subtotal || 0);
  const userId = String(req.body?.userId || "");

  const result = validatePromo({ promoCode, db, subtotal, userId });
  if (!result.valid) {
    res.status(400).json(result);
    return;
  }

  if (!result.promo) {
    res.json({ valid: true, discountAmount: 0, discountRate: 0, message: "No promo code applied." });
    return;
  }

  res.json({
    valid: true,
    message: result.message,
    promoCode: result.promo.code,
    discountType: result.promo.discountType,
    discountValue: result.promo.discountValue,
    discountAmount: roundInr(result.discountAmount),
    discountRate: result.discountRate,
  });
});

app.post("/api/events", async (req, res) => {
  const db = await readDb();
  const payload = req.body || {};
  const event = {
    ...payload,
    price: Number(payload.price || 0),
    vipPrice: Number(payload.vipPrice || payload.price || 0),
    vipSeats: Array.isArray(payload.vipSeats)
      ? [...new Set(payload.vipSeats.map((seat) => String(seat).toUpperCase()))]
      : [],
  };
  const idx = db.events.findIndex((e) => e.id === event.id);
  if (idx === -1) db.events.push(event);
  else db.events[idx] = { ...db.events[idx], ...event };
  await writeDb(db);
  res.json(event);
});

app.delete("/api/events/:id", async (req, res) => {
  const db = await readDb();
  const id = req.params.id;
  db.events = db.events.filter((e) => e.id !== id);
  db.bookings = db.bookings.filter((b) => b.eventId !== id);
  db.reviews = db.reviews.filter((r) => r.eventId !== id);
  await writeDb(db);
  res.json({ success: true });
});

app.post("/api/events/:id/cancel-refund", async (req, res) => {
  const db = await readDb();
  const id = req.params.id;
  const reason = req.body?.reason || "Event cancelled by admin";
  const affected = [];

  db.bookings = db.bookings.map((b) => {
    if (b.eventId !== id || ["fully_cancelled", "refunded"].includes(b.status)) return b;
    affected.push(b);
    db.refunds.push({
      id: `rfd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      bookingId: b.id,
      amount: b.totalAmount,
      reason,
      bankDetails: "Auto refund",
      status: "approved",
      createdAt: now(),
    });
    return {
      ...b,
      status: "fully_cancelled",
      bookingStatus: "fully_cancelled",
      activeSeats: [],
      cancelledSeats: b.selectedSeats || b.cancelledSeats || [],
      numTickets: 0,
      totalRefundAmount: roundInr(Number(b.totalRefundAmount || 0) + Number(b.totalAmount || 0)),
      totalAmount: 0,
      discountedAmount: 0,
      cgst: 0,
      sgst: 0,
    };
  });

  db.events = db.events.map((e) => (e.id === id ? { ...e, status: "cancelled" } : e));
  db.logs.push({ id: `log_${Date.now()}`, action: "Event Cancelled", details: `Event ${id} cancelled.`, timestamp: now(), date: now() });
  await writeDb(db);
  res.json(affected);
});

app.get("/api/bookings", async (_req, res) => {
  const db = await readDb();
  res.json(db.bookings || []);
});

app.get("/api/bookings/user/:userId", async (req, res) => {
  const db = await readDb();
  res.json((db.bookings || []).filter((b) => b.userId === req.params.userId));
});

app.get("/api/bookings/event/:eventId/seats", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  const seats = (db.bookings || [])
    .filter((b) => b.eventId === req.params.eventId && !["fully_cancelled", "refunded", "payment_failed"].includes(b.status))
    .flatMap((b) => getEffectiveSeats(b));
  res.json(seats);
});

app.post("/api/bookings", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  const { cgstRate, sgstRate } = getTaxSettings(db);
  const payload = req.body || {};
  const idx = db.events.findIndex((e) => e.id === payload.eventId);
  if (idx === -1) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const event = db.events[idx];
  const selectedSeats = payload.selectedSeats || [];
  const paymentStatus = payload.paymentStatus === "failed" ? "failed" : "paid";

  if (paymentStatus === "paid" && (db.events[idx].availableCapacity || 0) < selectedSeats.length) {
    res.status(400).json({ message: "Not enough capacity" });
    return;
  }

  const allBookedSeats = (db.bookings || [])
    .filter((booking) => booking.eventId === payload.eventId && !["fully_cancelled", "refunded", "refund_requested", "payment_failed"].includes(booking.status))
    .flatMap((booking) => getEffectiveSeats(booking));

  const seatConflict = selectedSeats.find((seat) => allBookedSeats.includes(seat));
  if (paymentStatus === "paid" && seatConflict) {
    res.status(409).json({ message: `Seat ${seatConflict} is already booked.` });
    return;
  }

  const seatPriceMap = buildSeatPriceMap(selectedSeats, event);
  const subtotal = Object.values(seatPriceMap).reduce((sum, amount) => sum + Number(amount || 0), 0);
  const promoCode = String(payload.promoCode || "").trim().toUpperCase();
  const promoResult = validatePromo({ promoCode, db, subtotal, userId: payload.userId });

  if (promoCode && !promoResult.valid) {
    res.status(400).json(promoResult);
    return;
  }

  const discountAmount = paymentStatus === "paid" ? Number(promoResult.discountAmount || 0) : 0;
  const discountRate = paymentStatus === "paid" ? Number(promoResult.discountRate || 0) : 0;
  const taxable = Math.max(0, subtotal - discountAmount);
  const cgst = taxable * (cgstRate / 100);
  const sgst = taxable * (sgstRate / 100);
  const roundedTotal = roundInr(taxable + cgst + sgst);

  const booking = {
    ...payload,
    id: payload.id || Date.now().toString(),
    transactionId: payload.transactionId || `TXN-${Date.now().toString().slice(-8)}`,
    selectedSeats,
    activeSeats: paymentStatus === "paid" ? [...selectedSeats] : [],
    cancelledSeats: [],
    seatPriceMap,
    bookingStatus: paymentStatus === "paid" ? "active" : "payment_failed",
    status: paymentStatus === "paid" ? "booked" : "payment_failed",
    bookingDate: payload.bookingDate || now(),
    paymentMethod: String(payload.paymentMethod || "upi").toLowerCase(),
    paymentStatus,
    promoCode: promoResult?.promo?.code || null,
    discountUsed: discountRate,
    originalTotal: roundInr(subtotal),
    discountAmount: roundInr(discountAmount),
    discountedAmount: roundInr(taxable),
    cgst: roundInr(cgst),
    sgst: roundInr(sgst),
    cgstRate,
    sgstRate,
    totalAmount: roundedTotal,
    totalRefundAmount: Number(payload.totalRefundAmount || 0),
    cancellationHistory: Array.isArray(payload.cancellationHistory) ? payload.cancellationHistory : [],
  };

  if (!booking.billId) {
    booking.billId = `BILL-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
  }

  db.bookings.push(booking);

  if (paymentStatus === "paid") {
    db.events[idx] = {
      ...db.events[idx],
      availableCapacity: Math.max(0, (db.events[idx].availableCapacity || 0) - selectedSeats.length),
    };

    if (promoResult?.promo) {
      const promoIdx = db.promoCodes.findIndex((promo) => promo.id === promoResult.promo.id);
      if (promoIdx !== -1) {
        db.promoCodes[promoIdx] = {
          ...db.promoCodes[promoIdx],
          usedCount: Number(db.promoCodes[promoIdx].usedCount || 0) + 1,
          updatedAt: now(),
        };
      }
    }
  }

  await writeDb(db);
  res.status(201).json(booking);
});

app.post("/api/bookings/:id/cancel", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);

  const bookingIdx = db.bookings.findIndex((booking) => booking.id === req.params.id);
  if (bookingIdx === -1) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const booking = db.bookings[bookingIdx];
  if (booking.status === "refund_requested") {
    res.status(400).json({ message: "A refund request is already pending admin approval for this booking." });
    return;
  }

  if (!["booked", "partially_cancelled"].includes(booking.status)) {
    res.status(400).json({ message: "Only active bookings can be cancelled." });
    return;
  }

  const activeSeats = getEffectiveSeats(booking);
  if (!activeSeats.length) {
    res.status(400).json({ message: "No active seats available for cancellation." });
    return;
  }

  const requestedSeatsRaw = Array.isArray(req.body?.seatIds) ? req.body.seatIds : [];
  const normalizedRequest = requestedSeatsRaw.length
    ? [...new Set(requestedSeatsRaw.map((seat) => String(seat)))]
    : [...activeSeats];

  const seatsToCancel = normalizedRequest.filter((seat) => activeSeats.includes(seat));
  if (!seatsToCancel.length) {
    res.status(400).json({ message: "Please select at least one valid seat to cancel." });
    return;
  }

  const seatPriceMap = booking.seatPriceMap || buildSeatPriceMap(booking.selectedSeats || [], { price: booking.ticketPrice, vipPrice: booking.vipPrice || booking.ticketPrice, vipSeats: booking.vipSeats || [] });
  const cancelSubtotalRaw = seatsToCancel.reduce((sum, seat) => sum + Number(seatPriceMap[seat] || booking.ticketPrice || 0), 0);
  const discountRate = Number(booking.discountUsed || 0);
  const cancelDiscountRaw = cancelSubtotalRaw * discountRate;
  const cancelTaxable = Math.max(0, cancelSubtotalRaw - cancelDiscountRaw);
  const cancelCgstRaw = cancelTaxable * (Number(booking.cgstRate || 9) / 100);
  const cancelSgstRaw = cancelTaxable * (Number(booking.sgstRate || 9) / 100);
  const refundAmountRaw = cancelTaxable + cancelCgstRaw + cancelSgstRaw;
  const refundAmount = clamp(roundInr(refundAmountRaw), 0, Number(booking.totalAmount || 0));

  const cancellationEntry = {
    id: `cnl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    reason: String(req.body?.reason || "User requested cancellation"),
    cancelledSeats: seatsToCancel,
    cancelledSeatCount: seatsToCancel.length,
    refundBreakdown: {
      seatSubtotal: roundInr(cancelSubtotalRaw),
      discountAdjustment: roundInr(cancelDiscountRaw),
      cgstAdjustment: roundInr(cancelCgstRaw),
      sgstAdjustment: roundInr(cancelSgstRaw),
      refundAmount,
    },
    createdAt: now(),
  };

  const refundRequest = {
    id: `rfd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    bookingId: booking.id,
    amount: refundAmount,
    reason: cancellationEntry.reason,
    bankDetails: booking.paymentMethod?.toUpperCase() || "N/A",
    status: "pending",
    seatCount: seatsToCancel.length,
    seatIds: seatsToCancel,
    cancellationType: seatsToCancel.length === activeSeats.length ? "full" : "partial",
    refundBreakdown: cancellationEntry.refundBreakdown,
    createdAt: now(),
  };

  db.refunds.push(refundRequest);

  db.bookings[bookingIdx] = {
    ...booking,
    statusBeforeRefundRequest: booking.status,
    status: "refund_requested",
    bookingStatus: "refund_requested",
    pendingRefundRequestId: refundRequest.id,
    pendingCancellationRequest: {
      ...cancellationEntry,
      refundId: refundRequest.id,
    },
  };

  await writeDb(db);
  res.json({
    booking: db.bookings[bookingIdx],
    refund: {
      id: refundRequest.id,
      amount: refundAmount,
      cancelledSeats: seatsToCancel,
      cancelledSeatCount: seatsToCancel.length,
      status: "pending",
    },
  });
});

app.post("/api/bookings/:id/refund", async (req, res) => {
  const db = await readDb();
  ensureDbShape(db);
  const bookingIdx = db.bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIdx === -1) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const isApproved = Boolean(req.body?.isApproved);
  const refundId = String(req.body?.refundId || "");
  const booking = db.bookings[bookingIdx];
  const pendingRefund = db.refunds.find((refund) => refund.bookingId === booking.id && refund.status === "pending" && (!refundId || refund.id === refundId));

  if (!pendingRefund) {
    res.status(404).json({ message: "Pending refund request not found." });
    return;
  }

  if (!booking.pendingCancellationRequest || booking.pendingCancellationRequest.refundId !== pendingRefund.id) {
    res.status(400).json({ message: "Booking has no matching pending cancellation request." });
    return;
  }

  if (isApproved) {
    const activeSeats = getEffectiveSeats(booking);
    const seatsToCancel = (pendingRefund.seatIds || []).filter((seat) => activeSeats.includes(seat));
    if (!seatsToCancel.length) {
      res.status(400).json({ message: "No cancellable seats found for this request." });
      return;
    }

    const seatPriceMap = booking.seatPriceMap || buildSeatPriceMap(booking.selectedSeats || [], {
      price: booking.ticketPrice,
      vipPrice: booking.vipPrice || booking.ticketPrice,
      vipSeats: booking.vipSeats || [],
    });
    const cancelSubtotalRaw = seatsToCancel.reduce((sum, seat) => sum + Number(seatPriceMap[seat] || booking.ticketPrice || 0), 0);
    const discountRate = Number(booking.discountUsed || 0);
    const cancelDiscountRaw = cancelSubtotalRaw * discountRate;
    const cancelTaxable = Math.max(0, cancelSubtotalRaw - cancelDiscountRaw);
    const cancelCgstRaw = cancelTaxable * (Number(booking.cgstRate || 9) / 100);
    const cancelSgstRaw = cancelTaxable * (Number(booking.sgstRate || 9) / 100);
    const refundAmountRaw = cancelTaxable + cancelCgstRaw + cancelSgstRaw;
    const refundAmount = clamp(roundInr(refundAmountRaw), 0, Number(booking.totalAmount || 0));

    const nextActiveSeats = activeSeats.filter((seat) => !seatsToCancel.includes(seat));
    const nextCancelledSeats = [...new Set([...(booking.cancelledSeats || []), ...seatsToCancel])];
    const isFull = nextActiveSeats.length === 0;

    const nextOriginalTotal = Math.max(0, roundInr(Number(booking.originalTotal || 0) - cancelSubtotalRaw));
    const nextDiscountAmount = Math.max(0, roundInr(Number(booking.discountAmount || 0) - cancelDiscountRaw));
    const nextDiscountedAmount = Math.max(0, roundInr(Number(booking.discountedAmount || 0) - cancelTaxable));
    const nextCgst = Math.max(0, roundInr(Number(booking.cgst || 0) - cancelCgstRaw));
    const nextSgst = Math.max(0, roundInr(Number(booking.sgst || 0) - cancelSgstRaw));
    const nextTotal = Math.max(0, roundInr(Number(booking.totalAmount || 0) - refundAmount));

    db.bookings[bookingIdx] = {
      ...booking,
      activeSeats: nextActiveSeats,
      cancelledSeats: nextCancelledSeats,
      numTickets: nextActiveSeats.length,
      bookingStatus: isFull ? "fully_cancelled" : "partially_cancelled",
      status: isFull ? "fully_cancelled" : "partially_cancelled",
      originalTotal: nextOriginalTotal,
      discountAmount: nextDiscountAmount,
      discountedAmount: nextDiscountedAmount,
      cgst: nextCgst,
      sgst: nextSgst,
      totalAmount: nextTotal,
      totalRefundAmount: roundInr(Number(booking.totalRefundAmount || 0) + refundAmount),
      cancellationHistory: [...(booking.cancellationHistory || []), booking.pendingCancellationRequest],
      pendingRefundRequestId: null,
      pendingCancellationRequest: null,
      statusBeforeRefundRequest: null,
    };

    pendingRefund.status = "approved";
    pendingRefund.approvedAt = now();
    pendingRefund.amount = refundAmount;

    const evIdx = db.events.findIndex((event) => event.id === booking.eventId);
    if (evIdx !== -1) {
      db.events[evIdx] = {
        ...db.events[evIdx],
        availableCapacity: Number(db.events[evIdx].availableCapacity || 0) + seatsToCancel.length,
      };
    }
  } else {
    pendingRefund.status = "rejected";
    pendingRefund.rejectedAt = now();
    db.bookings[bookingIdx] = {
      ...booking,
      status: booking.statusBeforeRefundRequest || "booked",
      bookingStatus: booking.statusBeforeRefundRequest || "booked",
      pendingRefundRequestId: null,
      pendingCancellationRequest: null,
      statusBeforeRefundRequest: null,
    };
  }

  await writeDb(db);
  res.json(db.bookings[bookingIdx]);
});

app.delete("/api/bookings/:id", async (req, res) => {
  const db = await readDb();
  db.bookings = db.bookings.filter((b) => b.id !== req.params.id);
  await writeDb(db);
  res.json({ success: true });
});

app.get("/api/refunds", async (_req, res) => {
  const db = await readDb();
  res.json(db.refunds || []);
});

app.delete("/api/refunds/:id", async (req, res) => {
  const db = await readDb();
  db.refunds = db.refunds.filter((r) => r.id !== req.params.id);
  await writeDb(db);
  res.json({ success: true });
});

app.post("/api/bookings/check-in", async (req, res) => {
  const db = await readDb();
  const billId = String(req.body?.billId || "");
  const eventId = String(req.body?.eventId || "");

  const idx = db.bookings.findIndex((b) => b.billId === billId);
  if (idx === -1) {
    res.json({ status: "not_found" });
    return;
  }
  const booking = db.bookings[idx];
  const event = db.events.find((e) => e.id === booking.eventId);

  const payload = {
    userName: booking.userName,
    seatNumbers: getEffectiveSeats(booking),
    eventName: booking.eventName || event?.name || "Unknown Event",
  };

  if (booking.eventId !== eventId) return res.json({ status: "event_mismatch", ...payload });
  if (booking.status === "checked-in") return res.json({ status: "already_checked_in", ...payload });
  if (["fully_cancelled", "refunded", "refund_requested", "payment_failed"].includes(booking.status)) return res.json({ status: "invalid_status", ...payload });

  const checkInEvent = db.events.find((e) => e.id === eventId);
  if (!checkInEvent) return res.json({ status: "not_found", ...payload });

  const today = new Date().toISOString().split("T")[0];
  if (checkInEvent.date !== today) return res.json({ status: "not_today", ...payload });

  db.bookings[idx] = { ...booking, status: "checked-in", checkInDate: now() };
  await writeDb(db);
  res.json({ status: "success", ...payload });
});

app.post("/api/bookings/:id/revert-check-in", async (req, res) => {
  const db = await readDb();
  const idx = db.bookings.findIndex((b) => b.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  db.bookings[idx] = { ...db.bookings[idx], status: "booked", checkInDate: null };
  await writeDb(db);
  res.json(db.bookings[idx]);
});

app.get("/api/reviews", async (_req, res) => {
  const db = await readDb();
  res.json(db.reviews || []);
});

app.post("/api/reviews", async (req, res) => {
  const db = await readDb();
  const review = req.body || {};
  db.reviews.push(review);
  await writeDb(db);
  res.status(201).json(review);
});

app.delete("/api/reviews/:id", async (req, res) => {
  const db = await readDb();
  db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
  await writeDb(db);
  res.json({ success: true });
});

app.get("/api/logs", async (_req, res) => {
  const db = await readDb();
  res.json(db.logs || []);
});

app.post("/api/logs", async (req, res) => {
  const db = await readDb();
  const payload = req.body || {};
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action: payload.action,
    details: payload.details,
    timestamp: now(),
    date: now(),
  };
  db.logs.push(log);
  await writeDb(db);
  res.status(201).json(log);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
