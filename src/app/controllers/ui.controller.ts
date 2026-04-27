import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import * as uiService from "../services/ui.service";
import { AppError } from "../../utils/appError";

export const getRoleList = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    const roles = await uiService.getRoleList();
    if (!roles) {
      throw AppError.notFound("No roles found");
    }
    res.status(200).json({ roles });
  }
);
