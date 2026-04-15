import { prisma } from "../utils/prisma.js";

export async function listAvailability(req, res) {
  const userId = req.query.userId;
  const records = await prisma.availability.findMany({
    where: userId ? { userId } : undefined,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  res.json(records);
}

export async function upsertAvailability(req, res) {
  const { userId, slots } = req.validated.body;
  const normalized = slots
    .map((slot) => ({
      ...slot,
      dayOfWeek: Number(slot.dayOfWeek),
      startTime: slot.startTime.trim(),
      endTime: slot.endTime.trim(),
      timezone: slot.timezone.trim(),
    }))
    .filter((slot) => slot.startTime < slot.endTime);

  const uniqueSlots = Array.from(
    new Map(normalized.map((slot) => [`${slot.dayOfWeek}|${slot.startTime}|${slot.endTime}|${slot.timezone}`, slot])).values(),
  );

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { userId } }),
    prisma.availability.createMany({
      data: uniqueSlots.map((slot) => ({ ...slot, userId })),
    }),
  ]);

  const records = await prisma.availability.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  res.json(records);
}
