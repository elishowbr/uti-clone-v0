"use client";

import { useActionState } from "react";
import { logout } from "@/app/actions/auth";
import { Loader2, Activity, LogOut } from "lucide-react";
import Link from "next/link";

export default function LogoutPage() {
    const [, formAction, isPending] = useActionState(logout, null);

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

                {/* Logout Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
                    <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5">
                        <LogOut className="h-7 w-7 text-red-500" />
                    </div>

                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                        Sair do Sistema
                    </h2>
                    <p className="text-slate-500 text-sm mb-8">
                        Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente para acessar o sistema.
                    </p>

                    <form action={formAction} className="space-y-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saindo...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2 h-5 w-5" />
                                    Confirmar Saída
                                </>
                            )}
                        </button>

                        <Link
                            href="/dashboard"
                            className="block w-full text-slate-600 hover:text-slate-800 font-medium py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-center"
                        >
                            Cancelar
                        </Link>
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
