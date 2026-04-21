import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import {
  loginSchema,
  registerSchema,
} from "../../validations/auth.validation";

const router = Router();

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.use(authenticate);
router.get("/me", authController.me);

export default router;
