import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    eventTypeId: z.string().min(1),
    startTime: z.string().datetime(),
    attendeeName: z.string().min(2),
    attendeeEmail: z.string().email(),
  }),
});

export const rescheduleSchema = z.object({
  params: z.object({ token: z.string().min(1) }),
  body: z.object({
    startTime: z.string().datetime(),
  }),
});
