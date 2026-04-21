import { Router } from "express";
import authRoutes from "./auth.routes";
import { authenticate } from "../../middleware/authenticate";
import uiRoutes from "./ui.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ui", uiRoutes);

// all routes after this point will be authenticated using the authenticate middleware
router.use(authenticate); 

export default router;
