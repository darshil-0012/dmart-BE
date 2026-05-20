import { Router } from "express";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/by-role/:role", userController.getUsersByRole);

export default router;