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

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
