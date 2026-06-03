"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    HeartPulse,
    Loader2,
    Stethoscope,
    TrendingUp,
    ArrowLeft
} from "lucide-react";
import { register } from "@/app/actions/register";

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
        description: "Acesso a painéis clínicos",
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
        value: "MANAGER",
        label: "Gestor",
        description: "Relatórios e indicadores",
        icon: <TrendingUp className="h-5 w-5" />,
        activeBg: "bg-amber-50",
        activeBorder: "border-amber-400",
        activeText: "text-amber-700",
        badgeBg: "bg-amber-100",
    },
];

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
            className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all duration-200 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400 ${
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
            <span className="text-sm font-bold leading-tight mt-1">{option.label}</span>
            <span className={`text-[11px] leading-tight mt-0.5 ${isActive ? "opacity-80" : "text-slate-400"}`}>
                {option.description}
            </span>
        </button>
    );
}

export default function InternalRegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedRole, setSelectedRole] = useState("DOCTOR");
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
            next.confirmPassword = "Confirme a senha.";
        } else if (password !== confirmPassword) {
            next.confirmPassword = "As senhas não coincidem.";
        }

        setClientErrors(next);
        return Object.keys(next).length === 0;
    }

    if (state?.success) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center space-y-5">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                        Cadastro Realizado!
                    </h2>
                    <p className="text-slate-500 leading-relaxed">
                        O funcionário foi cadastrado com sucesso no sistema.
                    </p>
                    <Link
                        href="/admin/funcionarios"
                        className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-sm text-sm text-center"
                    >
                        Voltar para a Lista de Funcionários
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <div className="mb-6 flex items-center gap-4">
                <Link 
                    href="/admin/funcionarios" 
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Novo Cadastro de Funcionário
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Preencha os dados para adicionar um novo membro à equipe.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <form
                    action={(formData) => {
                        if (!validateClient(formData)) return;
                        formAction(formData);
                    }}
                    noValidate
                    className="px-6 py-8 sm:px-10 space-y-6"
                >
                    <input type="hidden" name="role" value={selectedRole} />

                    <fieldset>
                        <legend className="text-sm font-bold text-slate-700 mb-3">
                            1. Selecione a Categoria (Cargo) <span className="text-red-500">*</span>
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                    <div className="h-px bg-slate-100 my-4" />

                    <fieldset>
                        <legend className="text-sm font-bold text-slate-700 mb-4">
                            2. Informações Básicas
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    htmlFor="register-fullname"
                                    className="block text-sm font-medium text-slate-600 mb-1.5"
                                >
                                    Nome Completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="register-fullname"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Nome do funcionário"
                                    disabled={isPending}
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                        clientErrors.fullName
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                                />
                                {clientErrors.fullName && (
                                    <p className="mt-1.5 text-xs text-red-600">{clientErrors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="register-email"
                                    className="block text-sm font-medium text-slate-600 mb-1.5"
                                >
                                    E-mail de Acesso <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="email@hospital.com"
                                    disabled={isPending}
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                        clientErrors.email
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                                />
                                {clientErrors.email && (
                                    <p className="mt-1.5 text-xs text-red-600">{clientErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="register-password"
                                    className="block text-sm font-medium text-slate-600 mb-1.5"
                                >
                                    Senha Inicial <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="register-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Mín. 8 caracteres"
                                        disabled={isPending}
                                        className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                            clientErrors.password
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {clientErrors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">{clientErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="register-confirm"
                                    className="block text-sm font-medium text-slate-600 mb-1.5"
                                >
                                    Confirmar Senha <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="register-confirm"
                                        name="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Repita a senha"
                                        disabled={isPending}
                                        className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                            clientErrors.confirmPassword
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {clientErrors.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-600">{clientErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {state?.error && (
                        <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mt-4">
                            <span className="font-medium">{state.error}</span>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end border-t border-slate-100 mt-6">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none text-sm"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cadastrando…
                                </>
                            ) : (
                                "Criar Cadastro do Funcionário"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
