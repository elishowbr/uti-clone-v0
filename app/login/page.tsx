"use client";

import { useState } from "react";
import { useActionState } from "react";
import { mockLogin } from "@/app/actions/mockAuth";
import Link from "next/link";
import {
    Activity,
    Eye,
    EyeOff,
    HeartPulse,
    Loader2,
    ShieldCheck,
    Stethoscope,
    TrendingUp,
} from "lucide-react";
import type { StaffRole } from "@/lib/mockUsers";

// ─── Role Configuration ───────────────────────────────────────────────────────

type RoleConfig = {
    label: string;
    description: string;
    email: string;
    password: string;
    icon: React.ReactNode;
    accentClass: string;
    activeBg: string;
    activeBorder: string;
    activeText: string;
    badgeBg: string;
    badgeText: string;
};

const ROLE_CONFIG: Record<StaffRole, RoleConfig> = {
    DOCTOR: {
        label: "Médico",
        description: "Painel clínico e evoluções",
        email: "medica@hospital.com.br",
        password: "Medico@2026",
        icon: <Stethoscope className="h-5 w-5" />,
        accentClass: "blue",
        activeBg: "bg-blue-50",
        activeBorder: "border-blue-400",
        activeText: "text-blue-700",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-700",
    },
    NURSE: {
        label: "Enfermeiro",
        description: "Gestão de leitos e pacientes",
        email: "enfermeiro@hospital.com.br",
        password: "Enfermeiro@2026",
        icon: <HeartPulse className="h-5 w-5" />,
        accentClass: "emerald",
        activeBg: "bg-emerald-50",
        activeBorder: "border-emerald-400",
        activeText: "text-emerald-700",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-700",
    },
    ADMIN: {
        label: "Administrador",
        description: "Gestão de sistema e usuários",
        email: "admin@hospital.com.br",
        password: "Admin@2026",
        icon: <ShieldCheck className="h-5 w-5" />,
        accentClass: "indigo",
        activeBg: "bg-indigo-50",
        activeBorder: "border-indigo-400",
        activeText: "text-indigo-700",
        badgeBg: "bg-indigo-100",
        badgeText: "text-indigo-700",
    },
    MANAGER: {
        label: "Gestor",
        description: "Relatórios e indicadores hospitalares",
        email: "gestor@hospital.com.br",
        password: "Gestor@2026",
        icon: <TrendingUp className="h-5 w-5" />,
        accentClass: "amber",
        activeBg: "bg-amber-50",
        activeBorder: "border-amber-400",
        activeText: "text-amber-700",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-700",
    },
};

const ROLE_ORDER: StaffRole[] = ["DOCTOR", "NURSE", "ADMIN", "MANAGER"];

// ─── Sub-components ───────────────────────────────────────────────────────────

type RoleCardProps = {
    role: StaffRole;
    config: RoleConfig;
    isActive: boolean;
    onClick: () => void;
};

function RoleCard({ role, config, isActive, onClick }: RoleCardProps) {
    return (
        <button
            id={`role-tab-${role.toLowerCase()}`}
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400 ${
                isActive
                    ? `${config.activeBg} ${config.activeBorder} ${config.activeText} shadow-sm`
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
        >
            <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    isActive ? `${config.badgeBg} ${config.activeText}` : "bg-slate-100 text-slate-500"
                }`}
            >
                {config.icon}
            </span>
            <span className="text-sm font-bold leading-tight mt-0.5">{config.label}</span>
            <span className={`text-[11px] leading-tight ${isActive ? "opacity-80" : "text-slate-400"}`}>
                {config.description}
            </span>
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(mockLogin, null);
    const [selectedRole, setSelectedRole] = useState<StaffRole>("DOCTOR");
    const [showPassword, setShowPassword] = useState(false);

    const config = ROLE_CONFIG[selectedRole];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
            {/* ── Left panel — Branding (hidden on mobile) ── */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-12 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-extrabold text-white tracking-tight">UTI Care</span>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                        </span>
                        Sistema Online
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                        Controle total<br />
                        <span className="text-cyan-200">dos seus leitos.</span>
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-xs">
                        Plataforma centralizada para equipes hospitalares acompanharem a UTI em tempo real.
                    </p>

                    {/* Stat pills */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {[
                            { label: "Leitos monitorados", value: "24/7" },
                            { label: "Perfis de acesso", value: "4" },
                            { label: "Conformidade LGPD", value: "✓" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/15 rounded-xl backdrop-blur-sm"
                            >
                                <span className="text-lg font-extrabold text-white">{stat.value}</span>
                                <span className="text-xs text-blue-200">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-blue-300 text-xs relative z-10">
                    © {new Date().getFullYear()} UTI Care. Versão protótipo.
                </p>
            </div>

            {/* ── Right panel — Login form ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16">
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">UTI Care</span>
                </div>

                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Card header */}
                        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Acesso à plataforma
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Selecione seu perfil e insira suas credenciais.
                            </p>
                        </div>

                        <div className="px-8 py-6 space-y-6">
                            {/* ── Role selector grid ── */}
                            <fieldset>
                                <legend className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                    Perfil de acesso
                                </legend>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {ROLE_ORDER.map((role) => (
                                        <RoleCard
                                            key={role}
                                            role={role}
                                            config={ROLE_CONFIG[role]}
                                            isActive={selectedRole === role}
                                            onClick={() => setSelectedRole(role)}
                                        />
                                    ))}
                                </div>
                            </fieldset>

                            {/* ── Form ── */}
                            <form action={formAction} className="space-y-4" noValidate>
                                {/* Hidden role field (used by server action for context if needed) */}
                                <input type="hidden" name="role" value={selectedRole} />

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="login-email"
                                        className="block text-sm font-medium text-slate-700 mb-1.5"
                                    >
                                        E-mail profissional
                                    </label>
                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="username"
                                        placeholder={config.email}
                                        disabled={isPending}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm disabled:opacity-60"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="login-password"
                                        className="block text-sm font-medium text-slate-700 mb-1.5"
                                    >
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            disabled={isPending}
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm disabled:opacity-60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Error message */}
                                {state?.error && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                                    >
                                        <span className="font-medium">{state.error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    id="login-submit"
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none text-sm mt-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Autenticando…
                                        </>
                                    ) : (
                                        "Entrar no sistema"
                                    )}
                                </button>
                            </form>

                            {/* ── Demo credentials hint ── */}
                            <div className={`rounded-xl p-4 border ${config.activeBg} ${config.activeBorder} transition-colors duration-300`}>
                                <p className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${config.activeText}`}>
                                    Credenciais de demonstração — {config.label}
                                </p>
                                <dl className={`space-y-1 text-xs ${config.activeText}`}>
                                    <div className="flex gap-1.5">
                                        <dt className="font-semibold opacity-70">E-mail:</dt>
                                        <dd className="font-mono">{config.email}</dd>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <dt className="font-semibold opacity-70">Senha:</dt>
                                        <dd className="font-mono">{config.password}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Card footer */}
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                Novo no sistema?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                >
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        © {new Date().getFullYear()} UTI Care · Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
