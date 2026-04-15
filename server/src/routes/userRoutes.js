import { Router } from "express";
import { getDefaultUser } from "../controllers/userController.js";

const router = Router();

router.get("/default", getDefaultUser);

export default router;
