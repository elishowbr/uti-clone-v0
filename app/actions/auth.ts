"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

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

    await createSession(String(user.id));

    redirect("/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
