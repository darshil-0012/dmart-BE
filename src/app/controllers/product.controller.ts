import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import * as productListService from "../services/product.service";
import { AppError } from "../../utils/appError";

export const getProductListFromStoreRoom = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    const productList = await productListService.getProductListFromStoreRoom();
    if (!productList) {
      throw AppError.notFound("productList");
    }
    res.status(200).json({ productList });
  },
);

export const setProductRefiller = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { productIds, userId } = req.body;
    const response = await productListService.setProductRefiller(
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
