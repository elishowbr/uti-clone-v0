"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { StaffRole } from "@/app/generated/prisma";

/**
 * Maps each StaffRole to the landing route after a successful login.
 *
 * - DOCTOR  → /admin   (painel clínico do médico)
 * - NURSE   → /dashboard (gestão de leitos)
 * - ADMIN   → /admin   (painel administrativo de sistema)
 * - MANAGER → /admin   (painel do gestor hospitalar)
 */
const ROLE_REDIRECT: Record<StaffRole, string> = {
    DOCTOR: "/admin",
    NURSE: "/dashboard",
    ADMIN: "/admin",
    MANAGER: "/admin",
};

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email e senha são obrigatórios" };
    }

    // user from db
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.password) {
        return { error: "Credenciais inválidas" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { error: "Credenciais inválidas" };
    }

    // Passa o role do usuário para a sessão JWT (habilita RBAC no middleware)
    await createSession(String(user.id), user.role);

    // Redireciona com base na categoria do usuário
    redirect(ROLE_REDIRECT[user.role] ?? "/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
