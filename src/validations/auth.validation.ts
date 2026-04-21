import { z } from "zod";
import { ASSIGNABLE_ROLES } from "../types/role";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().min(1, "Role is required").pipe(z.enum(ASSIGNABLE_ROLES, { message: "Please select a valid role" })),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = registerSchema.pick({
  email: true,
  password: true,
});

export type LoginInput = z.infer<typeof loginSchema>;
