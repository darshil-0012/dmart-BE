import { Router } from "express";
import * as product from "../controllers/product.controller";
import { requirePermission } from "../../middleware/rbac";
import { PERMISSIONS } from "../../types/permission";
import { validate } from "../../middleware/validate";
import { setProductRefillerSchema } from "../../validations/product.validation";

const router = Router();

router.get(
  "/store-room",
  requirePermission([PERMISSIONS.READ_STORE_INVENTORY]),
  product.getProductListFromStoreRoom,
);

router.post(
  "/set-product-refiller",
  requirePermission([PERMISSIONS.UPDATE_STORE_INVENTORY]),
  validate({ body: setProductRefillerSchema }),
  product.setProductRefiller,
);

export default router;