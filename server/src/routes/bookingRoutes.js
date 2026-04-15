import { Router } from "express";
import {
  cancelBooking,
  createBookingController,
  dashboardBookings,
  getPublicEventBySlug,
  getSlots,
  listDateOverrides,
  rescheduleBookingController,
  upsertDateOverride,
} from "../controllers/bookingController.js";
import { validate } from "../middleware/validate.js";
import { createBookingSchema, rescheduleSchema } from "../validators/bookingValidator.js";

const router = Router();

router.get("/public/:slug", getPublicEventBySlug);
router.get("/public/:slug/slots", getSlots);
router.post("/", validate(createBookingSchema), createBookingController);
router.get("/dashboard", dashboardBookings);
router.get("/overrides", listDateOverrides);
router.post("/overrides", upsertDateOverride);
router.patch("/:id/cancel", cancelBooking);
router.patch("/reschedule/:token", validate(rescheduleSchema), rescheduleBookingController);

export default router;
