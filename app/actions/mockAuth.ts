"use server";

import { findMockUserByEmail } from "@/lib/mockUsers";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

/**
 * Artificial delay applied on every authentication attempt.
 * Deters brute-force probing by making rapid successive attempts slow.
 */
const AUTH_DELAY_MS = 600;

const ROLE_REDIRECT: Record<string, string> = {
    DOCTOR: "/admin",
    NURSE: "/dashboard",
};

/**
 * Mock login server action.
 *
 * Validates credentials against the in-memory MOCK_STAFF_USERS list.
 * On success, writes a signed JWT session cookie and redirects the user
 * to the route appropriate for their role.
 *
 * Replace with a real DB-backed action once the User↔Staff domain is ready.
 */
export async function mockLogin(
    _prevState: { error: string } | null,
    formData: FormData,
): Promise<{ error: string }> {
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null) ?? "";

    // Always wait before responding to deter automated probing.
    await new Promise<void>((resolve) => setTimeout(resolve, AUTH_DELAY_MS));

    if (!email || !password) {
        return { error: "E-mail e senha são obrigatórios." };
    }

    const user = findMockUserByEmail(email);

    // Use a unified error message to avoid leaking whether the email exists.
    if (!user || user.password !== password) {
        return { error: "Credenciais inválidas. Verifique e-mail e senha." };
    }

    await createSession(user.id, user.role);

    redirect(ROLE_REDIRECT[user.role] ?? "/dashboard");
}
