import { Router } from "express";
import { listAvailability, upsertAvailability } from "../controllers/availabilityController.js";
import { validate } from "../middleware/validate.js";
import { availabilityUpsertSchema } from "../validators/availabilityValidator.js";

const router = Router();

router.get("/", listAvailability);
router.put("/", validate(availabilityUpsertSchema), upsertAvailability);

export default router;
