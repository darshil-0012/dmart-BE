import type { AppUser } from "../../types/user";
import { Role } from "../../types/role";
import type { AuthRequirements, AuthResult } from "../../types/rbac";

export class RBACService {
  static authorize(user: AppUser, requirements: AuthRequirements): AuthResult {
    if (user.role.key === Role.SUPER_ADMIN) {
      return {
        allowed: true,
        reason: "super-admin",
        userPermissions: user.permissions,
      };
    }

    if (
      requirements.roleKeys &&
      requirements.roleKeys.length > 0 &&
      !requirements.roleKeys.includes(user.role.key)
    ) {
      return {
        allowed: false,
        reason: "role-mismatch",
        userPermissions: user.permissions,
      };
    }

    if (requirements.permissions && requirements.permissions.length > 0) {
      const hasAllPermissions = requirements.permissions.every((permission) =>
        user.permissions.includes(permission),
      );

      if (!hasAllPermissions) {
        return {
          allowed: false,
          reason: "insufficient-permissions",
          userPermissions: user.permissions,
        };
      }
    }

    return {
      allowed: true,
      reason: "authorized",
      userPermissions: user.permissions,
    };
  }
}
