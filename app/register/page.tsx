"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
    Activity,
    CheckCircle2,
    Eye,
    EyeOff,
    HeartPulse,
    Loader2,
    ShieldCheck,
    Stethoscope,
    TrendingUp,
} from "lucide-react";
import { register } from "@/app/actions/register";

/**
 * RegisterPage — Tela de criação de conta do UTI Care com seleção de categoria.
 *
 * Integra com o server action real `register.ts` que persiste o usuário
 * no banco via Prisma com hash bcrypt e role selecionada.
 */

// ─── Role Configuration ───────────────────────────────────────────────────────

type RoleOption = {
    value: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    activeBg: string;
    activeBorder: string;
    activeText: string;
    badgeBg: string;
};

const ROLE_OPTIONS: RoleOption[] = [
    {
        value: "DOCTOR",
        label: "Médico",
        description: "Painel clínico e evoluções",
        icon: <Stethoscope className="h-5 w-5" />,
        activeBg: "bg-blue-50",
        activeBorder: "border-blue-400",
        activeText: "text-blue-700",
        badgeBg: "bg-blue-100",
    },
    {
        value: "NURSE",
        label: "Enfermeiro(a)",
        description: "Gestão de leitos e pacientes",
        icon: <HeartPulse className="h-5 w-5" />,
        activeBg: "bg-emerald-50",
        activeBorder: "border-emerald-400",
        activeText: "text-emerald-700",
        badgeBg: "bg-emerald-100",
    },
    {
        value: "ADMIN",
        label: "Administrador",
        description: "Gestão de sistema e usuários",
        icon: <ShieldCheck className="h-5 w-5" />,
        activeBg: "bg-indigo-50",
        activeBorder: "border-indigo-400",
        activeText: "text-indigo-700",
        badgeBg: "bg-indigo-100",
    },
    {
        value: "MANAGER",
        label: "Gestor",
        description: "Relatórios e indicadores hospitalares",
        icon: <TrendingUp className="h-5 w-5" />,
        activeBg: "bg-amber-50",
        activeBorder: "border-amber-400",
        activeText: "text-amber-700",
        badgeBg: "bg-amber-100",
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleCard({
    option,
    isActive,
    onClick,
}: {
    option: RoleOption;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400 ${
                isActive
                    ? `${option.activeBg} ${option.activeBorder} ${option.activeText} shadow-sm`
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
        >
            <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    isActive ? `${option.badgeBg} ${option.activeText}` : "bg-slate-100 text-slate-500"
                }`}
            >
                {option.icon}
            </span>
            <span className="text-sm font-bold leading-tight mt-0.5">{option.label}</span>
            <span className={`text-[11px] leading-tight ${isActive ? "opacity-80" : "text-slate-400"}`}>
                {option.description}
            </span>
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [selectedRole, setSelectedRole] = useState("NURSE");
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    function validateClient(formData: FormData): boolean {
        const next: Record<string, string> = {};
        const fullName = (formData.get("fullName") as string)?.trim() ?? "";
        const email = (formData.get("email") as string)?.trim() ?? "";
        const password = (formData.get("password") as string) ?? "";
        const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

        if (!fullName) next.fullName = "Nome completo é obrigatório.";
        if (!email) {
            next.email = "E-mail é obrigatório.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            next.email = "Formato de e-mail inválido.";
        }
        if (!password) {
            next.password = "Senha é obrigatória.";
        } else if (password.length < 8) {
            next.password = "A senha deve ter pelo menos 8 caracteres.";
        }
        if (!confirmPassword) {
            next.confirmPassword = "Confirme sua senha.";
        } else if (password !== confirmPassword) {
            next.confirmPassword = "As senhas não coincidem.";
        }
        if (!acceptedTerms) {
            next.terms = "Você deve aceitar os termos para continuar.";
        }

        setClientErrors(next);
        return Object.keys(next).length === 0;
    }

    // Show success state if server returned success
    if (state?.success) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
                {/* Header */}
                <header className="w-full bg-blue-600 shadow-lg shadow-blue-900/20 py-4 px-6 md:px-12 flex items-center">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-white tracking-tight">UTI Care</span>
                    </Link>
                </header>

                {/* Success Card */}
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Conta criada com sucesso!
                        </h2>
                        <p className="text-slate-500 leading-relaxed">
                            {state.message}
                        </p>
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 text-sm text-center"
                        >
                            Ir para o Login
                        </Link>
                    </div>
                </main>

                <footer className="bg-slate-900 text-slate-400 py-5 px-6">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <span>© {new Date().getFullYear()} UTI Care. Todos os direitos reservados.</span>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
            {/* ── Header ── */}
            <header className="w-full bg-blue-600 shadow-lg shadow-blue-900/20 py-4 px-6 md:px-12 flex items-center">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-extrabold text-white tracking-tight">UTI Care</span>
                </Link>
            </header>

            {/* ── Main ── */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Card header */}
                    <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Crie sua conta
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5">
                            Já possui uma conta?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Entre aqui.
                            </Link>
                        </p>
                    </div>

                    <form
                        action={(formData) => {
                            if (!validateClient(formData)) return;
                            formAction(formData);
                        }}
                        noValidate
                        className="px-8 py-6 space-y-5"
                    >
                        {/* Hidden role field */}
                        <input type="hidden" name="role" value={selectedRole} />

                        {/* ── Role selector grid ── */}
                        <fieldset>
                            <legend className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Categoria de Usuário <span className="text-red-500">*</span>
                            </legend>
                            <div className="grid grid-cols-2 gap-2.5">
                                {ROLE_OPTIONS.map((option) => (
                                    <RoleCard
                                        key={option.value}
                                        option={option}
                                        isActive={selectedRole === option.value}
                                        onClick={() => setSelectedRole(option.value)}
                                    />
                                ))}
                            </div>
                        </fieldset>

                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="register-fullname"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="register-fullname"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                placeholder="Insira seu nome"
                                disabled={isPending}
                                aria-invalid={!!clientErrors.fullName}
                                aria-describedby={clientErrors.fullName ? "error-fullname" : undefined}
                                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                    clientErrors.fullName
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                            />
                            {clientErrors.fullName && (
                                <p id="error-fullname" className="mt-1.5 text-xs text-red-600">
                                    {clientErrors.fullName}
                                </p>
                            )}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label
                                htmlFor="register-email"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                E-mail <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Insira seu email"
                                disabled={isPending}
                                aria-invalid={!!clientErrors.email}
                                aria-describedby={clientErrors.email ? "error-email" : undefined}
                                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                    clientErrors.email
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                            />
                            {clientErrors.email && (
                                <p id="error-email" className="mt-1.5 text-xs text-red-600">
                                    {clientErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="register-password"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Senha <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Mínimo 8 caracteres"
                                    disabled={isPending}
                                    aria-invalid={!!clientErrors.password}
                                    aria-describedby={clientErrors.password ? "error-password" : undefined}
                                    className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                        clientErrors.password
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {clientErrors.password && (
                                <p id="error-password" className="mt-1.5 text-xs text-red-600">
                                    {clientErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="register-confirm"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Confirmar Senha <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="register-confirm"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Repita sua senha"
                                    disabled={isPending}
                                    aria-invalid={!!clientErrors.confirmPassword}
                                    aria-describedby={clientErrors.confirmPassword ? "error-confirm" : undefined}
                                    className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                        clientErrors.confirmPassword
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {clientErrors.confirmPassword && (
                                <p id="error-confirm" className="mt-1.5 text-xs text-red-600">
                                    {clientErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Terms checkbox */}
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                                <input
                                    id="register-terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => {
                                        setAcceptedTerms(e.target.checked);
                                        if (clientErrors.terms) setClientErrors((p) => ({ ...p, terms: "" }));
                                    }}
                                    disabled={isPending}
                                    className="mt-0.5 w-4 h-4 rounded accent-blue-600 shrink-0"
                                />
                                <span className="text-sm text-slate-600 leading-relaxed">
                                    Eu concordo com os{" "}
                                    <a href="#" className="text-blue-600 hover:underline font-medium">
                                        termos de serviço
                                    </a>{" "}
                                    e{" "}
                                    <a href="#" className="text-blue-600 hover:underline font-medium">
                                        política de privacidade
                                    </a>
                                </span>
                            </label>
                            {clientErrors.terms && (
                                <p className="mt-1.5 text-xs text-red-600">{clientErrors.terms}</p>
                            )}
                        </div>

                        {/* Server-side error */}
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
                            id="register-submit"
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none text-sm mt-1"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Criando conta…
                                </>
                            ) : (
                                "Criar Conta"
                            )}
                        </button>
                    </form>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="bg-slate-900 text-slate-400 py-5 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    <span>© {new Date().getFullYear()} UTI Care. Todos os direitos reservados.</span>
                    <div className="flex items-center gap-4">
                        {["Facebook", "Instagram", "Twitter"].map((name) => (
                            <a
                                key={name}
                                href="#"
                                aria-label={name}
                                className="hover:text-white transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors">
                                    <span className="sr-only">{name}</span>
                                    <span className="text-[10px]" aria-hidden>
                                        {name[0]}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
