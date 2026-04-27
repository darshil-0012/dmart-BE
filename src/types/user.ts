import { Permission } from "./permission";
import { Role } from "./role";

export interface AppUser {
  name: string;
  email: string;
  role: {
    key:Role,
    name: string;
  };
  permissions: Permission[];
}
