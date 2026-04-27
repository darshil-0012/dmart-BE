import type { Request, Response } from "express";

import * as authService from "../services/auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "lax" as const,
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie("accessToken", accessToken, COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
}

function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
}

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { accessToken, refreshToken, user } = await authService.register(req.body);
  if(!user || !accessToken || !refreshToken) {
    throw AppError.notFound("failed to register");
  }
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ user });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  if(!user) {
    throw AppError.notFound("User not found");
  }
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user });
});

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw AppError.badRequest("Missing refresh token cookie");
  }
  await authService.logoutWithRefreshToken(refreshToken);
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
});

export const refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw AppError.badRequest("Missing refresh token cookie");
  }

  const { accessToken, refreshToken: newRefreshToken, user } =
    await authService.refreshWithToken(refreshToken);

  setAuthCookies(res, accessToken, newRefreshToken);
  res.status(200).json({ user });
});

export const me = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.badRequest("Missing authenticated user");
  }
  res.status(200).json({ user: req.user });
});
