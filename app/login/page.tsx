"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Loader2, Activity } from "lucide-react";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">UTI Care</h1>
                    <p className="text-slate-500 mt-2">Sistema de Gestão de Leitos</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">Acesso Restrito</h2>

                    <form action={formAction} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                                E-mail Profissional
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="nome@hospital.com.br"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar no Sistema"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-400 mt-8">
                    &copy; {new Date().getFullYear()} UTI Care. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
