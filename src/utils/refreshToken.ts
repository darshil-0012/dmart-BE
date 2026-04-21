import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

type RefreshTokenPayload = {
  tokenType: "refresh";
  nonce: string;
};

const REFRESH_SIGN_OPTIONS: SignOptions = {
  expiresIn: `${env.JWT_REFRESH_EXPIRES_DAYS}d`,
};

/** SHA-256 hex digest; must match how stored hashes are derived from plain refresh tokens. */
export function hashRefreshToken(plainToken: string): string {
  return crypto.createHash("sha256").update(plainToken).digest("hex");
}

/** Opaque refresh token for the client; hash is stored in the database. */
export function createRefreshTokenArtifacts(): {
  plainToken: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const payload: RefreshTokenPayload = {
    tokenType: "refresh",
    nonce: crypto.randomUUID(),
  };
  const plainToken = jwt.sign(payload, env.JWT_SECRET, REFRESH_SIGN_OPTIONS);
  const tokenHash = hashRefreshToken(plainToken);
  const decoded = jwt.decode(plainToken);

  if (!decoded || typeof decoded === "string" || !decoded.exp) {
    throw new Error("Failed to decode refresh token expiration");
  }

  const expiresAt = new Date(decoded.exp * 1000);
  return { plainToken, tokenHash, expiresAt };
}
