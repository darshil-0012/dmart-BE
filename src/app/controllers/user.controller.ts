import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import * as userService from "../services/users.service";
import { AppError } from "../../utils/appError";
import { AssignableRole } from "../../types/role";

export const getUsersByRole = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const rolesParams = req.params.role as AssignableRole; 
    const users = await userService.getUsersByRole(rolesParams);
    if (!users) {
      throw AppError.notFound("No users found for the specified role");
    }
    res.status(200).json({ users });
  }
);
