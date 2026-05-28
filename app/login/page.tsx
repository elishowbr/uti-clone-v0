"use client";

import { useActionState, useState } from "react";
import { mockLogin } from "@/app/actions/mockAuth";
import { Activity, Loader2, Key, ChevronDown, ChevronUp } from "lucide-react";

// Credenciais mockadas
const DEMO_CREDENTIALS = [
    {
        role: "Médico",
        email: "medica@hospital.com.br",
        password: "Medico@2026",
        destination: "Dashboard Médico"
    },
    {
        role: "Enfermeiro",
        email: "enfermeiro@hospital.com.br",
        password: "Enfermeiro@2026",
        destination: "UTI Adulto"
    }
];

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(mockLogin, null);
    const [showMocks, setShowMocks] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Brand header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 transform transition-transform hover:scale-105">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">UTI Care</h1>
                    <p className="text-slate-500 mt-2 font-medium">Sistema de Gestão Hospitalar</p>
                </div>

                {/* Login card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
                        Acesso da Equipe
                    </h2>

                    <form action={formAction} className="space-y-5">
                        <div>
                            <label
                                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                                placeholder="seu@email.com.br"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 bg-slate-50/50 focus:bg-white"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 bg-slate-50/50 focus:bg-white"
                                disabled={isPending}
                            />
                        </div>

                        {state?.error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
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

                    {/* Interactive Mock Credentials Toggle */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowMocks(!showMocks)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 rounded-lg hover:bg-slate-50"
                        >
                            <Key className="w-4 h-4" />
                            {showMocks ? "Ocultar credenciais de teste" : "Ver credenciais de teste"}
                            {showMocks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Collapsible Content */}
                        <div 
                            className={`grid transition-all duration-300 ease-in-out ${
                                showMocks ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                            <div className="overflow-hidden">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <div className="space-y-3">
                                        {DEMO_CREDENTIALS.map((cred, idx) => (
                                            <div key={idx} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                                                <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                                                    {cred.role} 
                                                    <span className="font-normal text-[10px] bg-slate-200/70 px-2 py-0.5 rounded-full text-slate-600">
                                                        {cred.destination}
                                                    </span>
                                                </p>
                                                <dl className="space-y-1 text-xs text-slate-600">
                                                    <div className="flex justify-between gap-2">
                                                        <dt className="font-medium">E-mail:</dt>
                                                        <dd className="font-mono text-slate-800 select-all">{cred.email}</dd>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <dt className="font-medium">Senha:</dt>
                                                        <dd className="font-mono text-slate-800 select-all">{cred.password}</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-8 font-medium">
                    &copy; {new Date().getFullYear()} UTI Care. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}