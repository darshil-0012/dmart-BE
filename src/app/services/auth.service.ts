import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { db } from "../../db";
import { refreshSessions } from "../../db/schema/refresh-session";
import { roles } from "../../db/schema/rbac";
import { user } from "../../db/schema/user";
import { generateAccessToken } from "../../utils/jwt";
import {
  createRefreshTokenArtifacts,
  hashRefreshToken,
} from "../../utils/refreshToken";
import type {
  LoginInput,
  RegisterInput,
} from "../../validations/auth.validation";
import { AppError } from "../../utils/appError";

const SALT_ROUNDS = 10;

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: {
    key: string;
    display_name: string;
  };
}

export async function getUserProfileById(userId: string): Promise<SessionUser> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      roleKey: roles.key,
      roleDisplayName: roles.displayName,
    })
    .from(user)
    .innerJoin(roles, eq(user.roleKey, roles.key))
    .where(eq(user.id, userId))
    .limit(1);

  const userData = rows[0];
  if (!userData) {
    throw new AppError("User not found", 404);
  }

  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: {
      key: userData.roleKey,
      display_name: userData.roleDisplayName,
    },
  };
}

async function createSessionForUser(userId: string) {
  const user = await getUserProfileById(userId);
  const { plainToken, tokenHash, expiresAt } = createRefreshTokenArtifacts();
  await db.insert(refreshSessions).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    expiresAt,
  });

  const accessToken = generateAccessToken({ userId, email: user.email });

  return {
    accessToken,
    refreshToken: plainToken,
    user,
  };
}

export async function register(input: RegisterInput) {
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError("A user with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const userId = crypto.randomUUID();

  await db.insert(user).values({
    id: userId,
    name: input.name,
    roleKey: input.role,
    email: input.email,
    password: hashedPassword,
  });

  return createSessionForUser(userId);
}

export async function login(input: LoginInput) {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    })
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  const userData = rows[0];
  if (!userData) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordOk = await bcrypt.compare(input.password, userData.password);
  if (!passwordOk) {
    throw new AppError("Invalid email or password", 401);
  }

  return createSessionForUser(userData.id);
}

/**
 * Validates refresh token, rotates it in the DB, returns new access + refresh tokens.
 */
export async function refreshWithToken(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  const now = new Date();

  const sessions = await db
    .select({
      sessionId: refreshSessions.id,
      userId: refreshSessions.userId,
    })
    .from(refreshSessions)
    .where(
      and(
        eq(refreshSessions.tokenHash, tokenHash),
        gt(refreshSessions.expiresAt, now),
      ),
    )
    .limit(1);

  const session = sessions[0];
  if (!session) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const dbUser = await getUserProfileById(session.userId);

  const { plainToken, tokenHash: newHash, expiresAt } = createRefreshTokenArtifacts();
  await db
    .update(refreshSessions)
    .set({ tokenHash: newHash, expiresAt })
    .where(eq(refreshSessions.id, session.sessionId));

  const accessToken = generateAccessToken({
    userId: dbUser.id,
    email: dbUser.email,
  });

  return {
    accessToken,
    refreshToken: plainToken,
    user: dbUser,
  };
}



export async function logoutWithRefreshToken(refreshToken:string){
  const tokenHash = hashRefreshToken(refreshToken);
  return await db.delete(refreshSessions).where(eq(refreshSessions.tokenHash, tokenHash));
}

export class ConflictError extends Error {
  public readonly statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends Error {
  public readonly statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
