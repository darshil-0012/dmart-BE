import type { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { env } from "../config/env";
import type { JwtPayload } from "../utils/jwt";
import type { AppUser } from "../types/user";
import { Permission } from "../types/permission";
import { Role } from "../types/role";
import { db } from "../db";
import { rolePermissions, roles } from "../db/schema";
import { user } from "../db/schema/user";

declare module "express" {
  interface Request {
    user?: AppUser;
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

/*
  Requires `Authorization: Bearer <access_jwt>`. Sets `req.user` on success.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {

  const token = parseBearer(req.headers.authorization) ?? req.cookies?.[ACCESS_TOKEN_COOKIE_KEY];

  if (!token) {
    res
      .status(401)
      .json({ message: "Missing token. Provide Bearer token or accessToken cookie." });
    return;
  }

  try {

    const jwtPayload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const userRows = await db
      .select({
        name: user.name,
        email: user.email,
        roleKey: user.roleKey,
        roleName: roles.displayName,
      })
      .from(user)
      .innerJoin(roles, eq(user.roleKey, roles.key))
      .where(eq(user.id, jwtPayload.userId))
      .limit(1);

    const userData = userRows[0];

    if (!userData) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }

    const rolePermissionsRows = await db
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleKey, userData.roleKey));

    req.user = {
      name: userData.name,
      email: userData.email,
      role: {
        key: userData.roleKey as Role,
        name: userData.roleName,
      },
      permissions: rolePermissionsRows.map(
        (permissionRow) => permissionRow.permissionKey as Permission,
      ),
    }

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
