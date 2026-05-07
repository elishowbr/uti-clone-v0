"use client";

import { useState } from "react";
import { useActionState } from "react";
import { mockLogin } from "@/app/actions/mockAuth";
import { Activity, HeartPulse, Loader2, Stethoscope } from "lucide-react";
import type { StaffRole } from "@/lib/mockUsers";

const DEMO_CREDENTIALS: Record<StaffRole, { email: string; password: string; label: string }> = {
    DOCTOR: {
        email: "medica@hospital.com.br",
        password: "Medico@2026",
        label: "Medicina Intensiva",
    },
    NURSE: {
        email: "enfermeiro@hospital.com.br",
        password: "Enfermeiro@2026",
        label: "UTI Adulto",
    },
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(mockLogin, null);
    const [selectedRole, setSelectedRole] = useState<StaffRole>("DOCTOR");

    const credentials = DEMO_CREDENTIALS[selectedRole];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Brand header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">UTI Care</h1>
                    <p className="text-slate-500 mt-2">Sistema de Gestão de Redes Hospitalares</p>
                </div>

                {/* Login card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
                        Acesso da Equipe
                    </h2>

                    {/* Role selector */}
                    <div className="flex rounded-xl bg-slate-100 p-1 mb-6 gap-1">
                        <RoleTab
                            active={selectedRole === "DOCTOR"}
                            label="Médico"
                            icon={<Stethoscope className="h-4 w-4" />}
                            onClick={() => setSelectedRole("DOCTOR")}
                        />
                        <RoleTab
                            active={selectedRole === "NURSE"}
                            label="Enfermeiro"
                            icon={<HeartPulse className="h-4 w-4" />}
                            onClick={() => setSelectedRole("NURSE")}
                        />
                    </div>

                    <form action={formAction} className="space-y-5">
                        <div>
                            <label
                                className="block text-sm font-medium text-slate-700 mb-1"
                                htmlFor="email"
                            >
                                E-mail Profissional
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="username"
                                placeholder={credentials.email}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium text-slate-700 mb-1"
                                htmlFor="password"
                            >
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                disabled={isPending}
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                "Entrar no Sistema"
                            )}
                        </button>
                    </form>

                    {/* Demo credentials hint – visible in prototype only */}
                    <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">
                            Credenciais de Demonstração
                        </p>
                        <dl className="space-y-1 text-xs text-amber-700">
                            <div className="flex gap-1">
                                <dt className="font-medium">E-mail:</dt>
                                <dd className="font-mono">{credentials.email}</dd>
                            </div>
                            <div className="flex gap-1">
                                <dt className="font-medium">Senha:</dt>
                                <dd className="font-mono">{credentials.password}</dd>
                            </div>
                            <dd className="text-amber-500 mt-1 pt-1 border-t border-amber-100">
                                {selectedRole === "DOCTOR" ? "Médico" : "Enfermeiro"} — {credentials.label}
                            </dd>
                        </dl>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-8">
                    &copy; {new Date().getFullYear()} UTI Care. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}

type RoleTabProps = {
    active: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
};

function RoleTab({ active, label, icon, onClick }: RoleTabProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
            }`}
        >
            {icon}
            {label}
        </button>
    );
}
