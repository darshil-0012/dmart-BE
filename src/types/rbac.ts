import type { Permission } from "./permission";
import type { Role } from "./role";

export interface AuthRequirements {
  roleKeys?: Role[];
  permissions?: Permission[];
}

export interface AuthResult {
  allowed: boolean;
  reason: string;
  userPermissions?: Permission[];
}
