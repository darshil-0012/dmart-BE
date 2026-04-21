import type { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { env } from "../config/env";
import type { JwtPayload } from "../utils/jwt";

declare module "express" {
  interface Request {
    auth?: JwtPayload;
  }
}

const BEARER_PREFIX = "Bearer ";
const ACCESS_TOKEN_COOKIE_KEY = "accessToken";

function parseBearer(header: string | undefined): string | null {
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}

/**
 * Requires `Authorization: Bearer <access_jwt>`. Sets `req.auth` on success.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = parseBearer(req.headers.authorization) ?? req.cookies?.[ACCESS_TOKEN_COOKIE_KEY];

  if (!token) {
    res
      .status(401)
      .json({ message: "Missing token. Provide Bearer token or accessToken cookie." });
    return;
  }

  try {
    req.auth = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ message: "Access token expired" });
      return;
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }
    console.error("authenticate error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
