import { z } from "zod";

export const eventTypeSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    title: z.string().min(3),
    description: z.string().optional().nullable(),
    duration: z.number().int().positive(),
    slug: z.string().min(3),
    bufferTime: z.number().int().min(0).default(0),
    questions: z.array(z.object({}).passthrough()).optional().nullable(),
  }),
});

export const eventTypeUpdateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    duration: z.number().int().positive().optional(),
    slug: z.string().min(3).optional(),
    bufferTime: z.number().int().min(0).optional(),
    questions: z.array(z.object({}).passthrough()).optional().nullable(),
  }),
});
