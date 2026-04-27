import { Router } from "express";
import * as productListController from "../controllers/product-list.controller";

const router = Router();

router.get("/store-room", productListController.getProductList);

export default router;