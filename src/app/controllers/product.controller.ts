import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import * as productListService from "../services/product.service";
import { AppError } from "../../utils/appError";

export const getProductList = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    const productList = await productListService.getProductList();
    if (!productList) {
      throw AppError.notFound("productList");
    }
    res.status(200).json({ productList });
  },
);

export const updateProductRefiller = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { productId, userIds } = req.body;
    const response = await productListService.updateProductRefiller(productId, userIds);
    if (!response) {
      throw new AppError("Failed to update product refiller", 500);
    }
    res.status(200).json({
      message: "Product refiller updated successfully",
      data: { productId, userIds },
    });
  },
);

export const setProductRefillerByUserId = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { productIds, userId } = req.body;
    const response = await productListService.setProductRefillerByUserId(
      productIds,
      userId,
    );
    if (!response) {
      throw new AppError("Failed to set product refiller", 500);
    }
    res.status(200).json({
      message: "Product refiller set successfully",
      data: {
        userId,
        productIds,
      },
    });
  },
);
