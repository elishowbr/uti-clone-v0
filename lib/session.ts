import { SignJWT, jwtVerify } from "jose";
import type { StaffRole } from "./mockUsers";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "fallback-secret-for-development-only-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Creates an authenticated session cookie containing the user ID and,
 * optionally, their staff role for role-based routing.
 */
export async function createSession(userId: string, role?: StaffRole) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const payload: Record<string, unknown> = { userId, expiresAt };
  if (role) payload.role = role;

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function verifySession(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
