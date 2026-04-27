import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import * as productListService from "../services/product-list.service";
import { AppError } from "../../utils/appError";

export const getProductListFromStoreRoomSection = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    const productList = await productListService.getProductListFromStoreRoomSection();
    if (!productList) {
      throw AppError.notFound("productList");
    }
    res.status(200).json({ productList });
  }
);
