import { z } from "zod";

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1),
});

export const availabilityUpsertSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    slots: z.array(slotSchema),
  }),
});
