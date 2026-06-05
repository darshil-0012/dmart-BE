import { z } from "zod";

export const setProductRefillerSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  productIds: z.array(z.string().min(1)).min(1, "At least one productId is required"),
});

export type SetProductRefillerInput = z.infer<typeof setProductRefillerSchema>;

export const updateProductRefillerSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  userIds: z.array(z.string().min(1)).min(1, "At least one userId is required"),
});

export type UpdateProductRefillerInput = z.infer<typeof updateProductRefillerSchema>;
