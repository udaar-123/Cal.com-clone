import { Router } from "express";
import {
  createEventType,
  deleteEventType,
  listEventTypes,
  updateEventType,
} from "../controllers/eventTypeController.js";
import { validate } from "../middleware/validate.js";
import { eventTypeSchema, eventTypeUpdateSchema } from "../validators/eventTypeValidator.js";

const router = Router();

router.get("/", listEventTypes);
router.post("/", validate(eventTypeSchema), createEventType);
router.patch("/:id", validate(eventTypeUpdateSchema), updateEventType);
router.delete("/:id", deleteEventType);

export default router;
