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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "event-api" });
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
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.events)) db.events = [];
  if (!Array.isArray(db.bookings)) db.bookings = [];
  if (!Array.isArray(db.refunds)) db.refunds = [];
  if (!Array.isArray(db.reviews)) db.reviews = [];
  if (!Array.isArray(db.logs)) db.logs = [];
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
  res.json(db.events || []);
});

app.post("/api/events", async (req, res) => {
  const db = await readDb();
  const event = req.body || {};
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
    if (b.eventId !== id || ["refunded", "cancelled"].includes(b.status)) return b;
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
    return { ...b, status: "refunded" };
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
  const seats = (db.bookings || [])
    .filter((b) => b.eventId === req.params.eventId && !["cancelled", "refunded", "refund_requested"].includes(b.status))
    .flatMap((b) => b.selectedSeats || []);
  res.json(seats);
});

app.post("/api/bookings", async (req, res) => {
  const db = await readDb();
  const payload = req.body || {};
  const idx = db.events.findIndex((e) => e.id === payload.eventId);
  if (idx === -1) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  const selectedSeats = payload.selectedSeats || [];
  if ((db.events[idx].availableCapacity || 0) < selectedSeats.length) {
    res.status(400).json({ message: "Not enough capacity" });
    return;
  }
  const booking = {
    ...payload,
    selectedSeats,
    status: payload.status || "booked",
    bookingDate: payload.bookingDate || now(),
  };
  db.bookings.push(booking);
  db.events[idx] = {
    ...db.events[idx],
    availableCapacity: Math.max(0, (db.events[idx].availableCapacity || 0) - selectedSeats.length),
  };
  await writeDb(db);
  res.status(201).json(booking);
});

app.post("/api/bookings/:id/refund", async (req, res) => {
  const db = await readDb();
  const bookingIdx = db.bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIdx === -1) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const isApproved = Boolean(req.body?.isApproved);
  const booking = db.bookings[bookingIdx];
  if (isApproved) {
    db.bookings[bookingIdx] = { ...booking, status: "refunded" };
    const evIdx = db.events.findIndex((e) => e.id === booking.eventId);
    if (evIdx !== -1) {
      db.events[evIdx] = { ...db.events[evIdx], availableCapacity: (db.events[evIdx].availableCapacity || 0) + (booking.numTickets || 0) };
    }
    db.refunds.push({
      id: `rfd_${Date.now()}`,
      bookingId: booking.id,
      amount: booking.totalAmount,
      reason: "Admin approved refund",
      bankDetails: "N/A",
      status: "approved",
      createdAt: now(),
    });
  } else {
    db.bookings[bookingIdx] = { ...booking, status: "booked" };
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
    res.json("not_found");
    return;
  }
  const booking = db.bookings[idx];
  if (booking.eventId !== eventId) return res.json("event_mismatch");
  if (booking.status === "checked-in") return res.json("already_checked_in");
  if (["cancelled", "refunded", "refund_requested"].includes(booking.status)) return res.json("invalid_status");

  const event = db.events.find((e) => e.id === eventId);
  if (!event) return res.json("not_found");

  const today = new Date().toISOString().split("T")[0];
  if (event.date !== today) return res.json("not_today");

  db.bookings[idx] = { ...booking, status: "checked-in", checkInDate: now() };
  await writeDb(db);
  res.json("success");
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
