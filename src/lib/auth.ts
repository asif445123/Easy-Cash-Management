import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";

export const AUTH_COOKIE_NAME = "easycash_token";

/** Reads and verifies the auth cookie inside a Route Handler / Server Component. */
export async function getAuthUser(): Promise<TokenPayload | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Throws-free guard: returns the payload only if the user is an approved admin. */
export async function requireAdmin(): Promise<TokenPayload | null> {
  const user = await getAuthUser();
  if (!user || user.role !== "admin" || user.status !== "approved") return null;
  return user;
}

/** Returns the payload only if the user is approved (any role). */
export async function requireApprovedUser(): Promise<TokenPayload | null> {
  const user = await getAuthUser();
  if (!user || user.status !== "approved") return null;
  return user;
}
