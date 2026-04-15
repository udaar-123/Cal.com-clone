import { addDays, addMinutes, isAfter, isBefore } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "../utils/prisma.js";

function buildDateTime(dateString, hhmm, timezone) {
  const [hour, minute] = hhmm.split(":").map(Number);
  const localIso = `${dateString}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return fromZonedTime(localIso, timezone);
}

export async function getAvailableSlots(eventType, dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return [];
  }
  const hostTimezone = eventType.user?.timezone || "UTC";
  const dayStart = fromZonedTime(`${dateString}T00:00:00`, hostTimezone);
  const dayEnd = addDays(dayStart, 1);
  const weekday = toZonedTime(dayStart, hostTimezone).getDay();

  const [availability, existingBookings, override] = await Promise.all([
    prisma.availability.findMany({
      where: { userId: eventType.userId, dayOfWeek: weekday },
      orderBy: { startTime: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        eventTypeId: eventType.id,
        status: "CONFIRMED",
        startTime: { gte: dayStart, lt: dayEnd },
      },
    }),
    prisma.dateOverride.findFirst({
      where: {
        eventTypeId: eventType.id,
        date: { gte: dayStart, lt: dayEnd },
      },
    }),
  ]);

  if (override?.isBlocked) {
    return [];
  }

  const ranges =
    override?.startTime && override?.endTime
      ? [{ startTime: override.startTime, endTime: override.endTime }]
      : availability;
  if (!ranges.length) {
    return [];
  }

  const slots = [];
  const now = new Date();

  for (const range of ranges) {
    const rangeTimezone = range.timezone || hostTimezone;
    let slotStart = buildDateTime(dateString, range.startTime, rangeTimezone);
    const rangeEnd = buildDateTime(dateString, range.endTime, rangeTimezone);

    while (isBefore(addMinutes(slotStart, eventType.duration), addMinutes(rangeEnd, 1))) {
      const slotEnd = addMinutes(slotStart, eventType.duration);

      const overlaps = existingBookings.some((booking) => {
        const bufferedStart = addMinutes(booking.startTime, -eventType.bufferTime);
        const bufferedEnd = addMinutes(booking.endTime, eventType.bufferTime);
        return isBefore(slotStart, bufferedEnd) && isAfter(slotEnd, bufferedStart);
      });

      if (!overlaps && isAfter(slotStart, now)) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          label: formatInTimeZone(slotStart, rangeTimezone, "HH:mm"),
          timezone: rangeTimezone,
        });
      }

      slotStart = addMinutes(slotStart, eventType.duration);
    }
  }

  return slots;
}
