import { addMinutes, parseISO } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../utils/prisma.js";
import { sendBookingEmail } from "./mailService.js";

const RESCHEDULE_TOKEN_VALIDITY_DAYS = 30;

export async function createBooking({ eventType, startTime, attendeeName, attendeeEmail }) {
  const start = parseISO(startTime);
  const end = addMinutes(start, eventType.duration);
  const now = new Date();

  if (Number.isNaN(start.getTime())) {
    throw { status: 400, message: "Invalid booking date selected." };
  }
  if (start <= now) {
    throw { status: 400, message: "Cannot book a time in the past." };
  }

  const overlapping = await prisma.booking.findFirst({
    where: {
      eventTypeId: eventType.id,
      status: "CONFIRMED",
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (overlapping) {
    throw { status: 409, message: "Selected slot is no longer available." };
  }

  const booking = await prisma.booking.create({
    data: {
      eventTypeId: eventType.id,
      hostId: eventType.userId,
      startTime: start,
      endTime: end,
      attendeeName,
      attendeeEmail,
      rescheduleToken: uuidv4(),
    },
    include: {
      eventType: true,
      host: true,
    },
  });

  await sendBookingEmail({
    to: attendeeEmail,
    subject: `Booking Confirmed: ${eventType.title}`,
    html: `<p>Hi ${attendeeName}, your booking for ${eventType.title} is confirmed.</p>`,
  });

  return booking;
}

export async function rescheduleBooking(token, startTime) {
  const booking = await prisma.booking.findUnique({
    where: { rescheduleToken: token },
    include: { eventType: true },
  });

  if (!booking) {
    throw { status: 404, message: "Invalid reschedule token." };
  }
  if (booking.status === "CANCELLED") {
    throw { status: 400, message: "Cancelled bookings cannot be rescheduled." };
  }

  const tokenExpiry = addMinutes(booking.createdAt, RESCHEDULE_TOKEN_VALIDITY_DAYS * 24 * 60);
  if (tokenExpiry < new Date()) {
    throw { status: 410, message: "Reschedule token has expired." };
  }

  const start = parseISO(startTime);
  const end = addMinutes(start, booking.eventType.duration);
  if (Number.isNaN(start.getTime())) {
    throw { status: 400, message: "Invalid reschedule date selected." };
  }
  if (start <= new Date()) {
    throw { status: 400, message: "Cannot reschedule to a past time." };
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      id: { not: booking.id },
      eventTypeId: booking.eventTypeId,
      status: "CONFIRMED",
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (conflict) {
    throw { status: 409, message: "Requested time conflicts with another booking." };
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: { startTime: start, endTime: end },
  });
}
