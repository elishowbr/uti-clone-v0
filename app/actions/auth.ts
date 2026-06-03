"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { StaffRole } from "@/app/generated/prisma";

/**
 * Maps each StaffRole to the landing route after a successful login.
 *
 * - DOCTOR  → /dashboard (painel clínico do médico)
 * - NURSE   → /dashboard (gestão de leitos)
 * - ADMIN   → /admin     (painel administrativo de sistema)
 * - MANAGER → /admin     (painel do gestor hospitalar)
 */
const ROLE_REDIRECT: Record<StaffRole, string> = {
    DOCTOR:  "/medico",
    NURSE:   "/sem-acesso",
    ADMIN:   "/admin",
    MANAGER: "/admin",
};

export async function login(prevState: any, formData: FormData) {
    const email    = formData.get("email")    as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email e senha são obrigatórios" };
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, password: true, role: true, active: true },
    });

    if (!user || !user.password) {
        return { error: "Credenciais inválidas" };
    }

    if (!user.active) {
        return { error: "Sua conta foi desativada. Fale com a administração." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return { error: "Credenciais inválidas" };
    }

    await createSession(String(user.id), user.role);

    if (user.role === "NURSE") {
        const links = await prisma.hospitalUser.findMany({
            where: { user_id: user.id },
            select: { hospital_id: true },
        });
        if (links.length === 0) redirect("/sem-acesso");
        if (links.length === 1) redirect(`/${links[0].hospital_id}/dashboard`);
        redirect("/nurse/hospitais");
    }

    redirect(ROLE_REDIRECT[user.role] ?? "/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
