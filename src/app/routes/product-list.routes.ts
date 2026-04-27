import { Router } from "express";
import * as productListController from "../controllers/product-list.controller";
import { requirePermission } from "../../middleware/rbac";
import { Permission } from "../../types/permission";

const router = Router();

router.get(
  "/store-room",
  requirePermission([Permission.READ_STORE_INVENTORY]),
  productListController.getProductListFromStoreRoomSection,
);

export default router;