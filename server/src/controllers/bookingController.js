import { startOfDay } from "date-fns";
import { prisma } from "../utils/prisma.js";
import { createBooking, rescheduleBooking } from "../services/bookingService.js";
import { getAvailableSlots } from "../services/slotService.js";

export async function getPublicEventBySlug(req, res, next) {
  console.log("[booking] getPublicEventBySlug slug=", req.params.slug);
  const eventType = await prisma.eventType.findUnique({
    where: { slug: req.params.slug },
    include: { user: true },
  });

  if (!eventType) {
    return next({ status: 404, message: "Event type not found." });
  }

  return res.json(eventType);
}

export async function getSlots(req, res, next) {
  console.log("[booking] getSlots slug/date=", req.params.slug, req.query.date);
  if (!req.query.date) {
    return next({ status: 400, message: "Query parameter `date` is required (YYYY-MM-DD)." });
  }
  const eventType = await prisma.eventType.findUnique({
    where: { slug: req.params.slug },
    include: { user: true },
  });
  if (!eventType) {
    return next({ status: 404, message: "Event type not found." });
  }
  const date = new Date(req.query.date);
  if (Number.isNaN(date.getTime())) {
    return next({ status: 400, message: "Invalid date format. Use YYYY-MM-DD." });
  }
  const slots = await getAvailableSlots(eventType, req.query.date);
  console.log("[booking] generated slots count=", slots.length);
  return res.json(slots);
}

export async function createBookingController(req, res, next) {
  const eventType = await prisma.eventType.findUnique({
    where: { id: req.validated.body.eventTypeId },
  });
  if (!eventType) {
    return next({ status: 404, message: "Event type not found." });
  }
  const booking = await createBooking({ eventType, ...req.validated.body });
  return res.status(201).json(booking);
}

export async function dashboardBookings(req, res) {
  const userId = req.query.userId;
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: { hostId: userId },
    include: { eventType: true },
    orderBy: { startTime: "asc" },
  });
  res.json({
    upcoming: bookings.filter((booking) => booking.startTime >= now && booking.status === "CONFIRMED"),
    past: bookings.filter((booking) => booking.startTime < now || booking.status === "CANCELLED"),
  });
}

export async function cancelBooking(req, res, next) {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) {
    return next({ status: 404, message: "Booking not found." });
  }
  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });
  return res.json(updated);
}

export async function rescheduleBookingController(req, res) {
  const updated = await rescheduleBooking(req.validated.params.token, req.validated.body.startTime);
  res.json(updated);
}

export async function upsertDateOverride(req, res) {
  const { eventTypeId, date, isBlocked, startTime, endTime } = req.body;
  const day = startOfDay(new Date(date));
  const override = req.body.id
    ? await prisma.dateOverride.update({
        where: { id: req.body.id },
        data: { date: day, isBlocked, startTime, endTime },
      })
    : await prisma.dateOverride.create({
        data: { eventTypeId, date: day, isBlocked, startTime, endTime },
      });
  res.json(override);
}

export async function listDateOverrides(req, res) {
  const rows = await prisma.dateOverride.findMany({
    where: { eventTypeId: req.query.eventTypeId },
    orderBy: { date: "asc" },
  });
  res.json(rows);
}
