import { SignJWT, jwtVerify } from "jose";

/**
 * IMPORTANT: this file must work in BOTH the Node.js runtime (API routes)
 * and the Edge runtime (middleware.ts). `jsonwebtoken` relies on Node's
 * `crypto` module and fails silently (or throws) in Edge — that was the
 * root cause of the login redirect bug. `jose` works in both runtimes.
 */

export interface TokenPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Read the secret lazily, at call time, NOT at module load. next build
// imports this file while collecting page data — a top-level throw kills
// the whole build if JWT_SECRET isn't set in the build environment, even
// though Render injects it at runtime.
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined. Add it under Render → your service → Environment."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}