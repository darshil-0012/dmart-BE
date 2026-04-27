import { Router } from "express";
import authRoutes from "./auth.routes";
import { authenticate } from "../../middleware/authenticate";
import uiRoutes from "./ui.routes";
import productListRoute from "./product-list.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ui", uiRoutes);

// all routes after this point will be authenticated using the authenticate middleware
router.use(authenticate); 
router.use("/product-list",productListRoute)

export default router;
