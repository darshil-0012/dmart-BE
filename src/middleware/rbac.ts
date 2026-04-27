import type { NextFunction, Request, Response } from "express";

import { RBACService } from "../app/services/rbac.service";
import type { AuthRequirements } from "../types/rbac";
import type { Permission } from "../types/permission";
import { Role } from "../types/role";

export function createRBACMiddleware(requirements: AuthRequirements) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const result = RBACService.authorize(req.user, requirements);
    if (!result.allowed) {
      res.status(403).json({
        success: false,
        message: "Access denied",
        reason: result.reason,
      });
      return;
    }

    next();
  };
}

export const requirePermission = (permissions: Permission[]) =>
  createRBACMiddleware({ permissions });

export const requireRole = (roleKeys: Role[]) => createRBACMiddleware({ roleKeys });

export const requireSuperAdmin = () =>
  createRBACMiddleware({ roleKeys: [Role.SUPER_ADMIN] });
