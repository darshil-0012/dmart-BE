import { z } from "zod";

export const setProductRefillerSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  productIds: z.array(z.string().min(1)).min(1, "At least one productId is required"),
});

export type SetProductRefillerInput = z.infer<typeof setProductRefillerSchema>;
