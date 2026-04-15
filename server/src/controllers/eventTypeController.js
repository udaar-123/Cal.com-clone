import { prisma } from "../utils/prisma.js";

export async function listEventTypes(req, res) {
  const userId = req.query.userId;
  const eventTypes = await prisma.eventType.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(eventTypes);
}

export async function createEventType(req, res) {
  const eventType = await prisma.eventType.create({ data: req.validated.body });
  res.status(201).json(eventType);
}

export async function updateEventType(req, res) {
  const eventType = await prisma.eventType.update({
    where: { id: req.validated.params.id },
    data: req.validated.body,
  });
  res.json(eventType);
}

export async function deleteEventType(req, res) {
  await prisma.eventType.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
