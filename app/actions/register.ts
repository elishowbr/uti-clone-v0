"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { StaffRole } from "@/app/generated/prisma";

/**
 * Roles válidas para registro.
 * Usado para validação server-side do campo de categoria.
 */
const VALID_ROLES: StaffRole[] = ["DOCTOR", "NURSE", "ADMIN", "MANAGER"];

/**
 * Rótulos amigáveis para cada role (usados em mensagens de erro/sucesso).
 */
const ROLE_LABELS: Record<StaffRole, string> = {
    DOCTOR: "Médico",
    NURSE: "Enfermeiro(a)",
    ADMIN: "Administrador",
    MANAGER: "Gestor",
};

export type RegisterState = {
    error?: string;
    success?: boolean;
    message?: string;
} | null;

/**
 * Server action para registro de novo usuário no banco via Prisma.
 *
 * Validações:
 *  - Campos obrigatórios (nome, email, senha, confirmação, role)
 *  - Formato de email básico
 *  - Senha mínima de 8 caracteres
 *  - Confirmação de senha
 *  - Role válida
 *  - Email único (não duplicado)
 *
 * A senha é armazenada com hash bcrypt (custo 10).
 */
export async function register(
    _prevState: RegisterState,
    formData: FormData,
): Promise<RegisterState> {
    const fullName = (formData.get("fullName") as string | null)?.trim() ?? "";
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";
    const roleRaw = (formData.get("role") as string | null)?.trim() ?? "";

    // --- Validações ---
    if (!fullName) {
        return { error: "Nome completo é obrigatório." };
    }

    if (!email) {
        return { error: "E-mail é obrigatório." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Formato de e-mail inválido." };
    }

    if (!password) {
        return { error: "Senha é obrigatória." };
    }

    if (password.length < 8) {
        return { error: "A senha deve ter pelo menos 8 caracteres." };
    }

    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem." };
    }

    if (!roleRaw || !VALID_ROLES.includes(roleRaw as StaffRole)) {
        return { error: "Selecione uma categoria de usuário válida." };
    }

    const role = roleRaw as StaffRole;

    // --- Verificar duplicidade de email ---
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "Este e-mail já está cadastrado no sistema." };
    }

    // --- Criar usuário ---
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: fullName,
            email,
            password: passwordHash,
            role,
        },
    });

    // Create a clinical/professional profile (Doctor table) for the new user
    // This ensures personalized data appears correctly in the dashboard (/medico)
    await prisma.doctor.create({
        data: {
            user_id: String(user.id),
            name: fullName,
            crm: role === "NURSE" ? "COREN pendente" : (role === "DOCTOR" ? "CRM pendente" : "-"),
            position: ROLE_LABELS[role],
        }
    });

    return {
        success: true,
        message: `Conta criada com sucesso! Categoria: ${ROLE_LABELS[role]}. Faça login para acessar o sistema.`,
    };
}
