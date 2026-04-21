import { Router } from "express";
import * as uiController from "../controllers/ui.controller";

const router = Router();

router.get("/get-role-list", uiController.getRoleList);

export default router;