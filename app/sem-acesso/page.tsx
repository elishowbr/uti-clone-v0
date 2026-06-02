"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, LogOut } from "lucide-react";

export default function SemAcessoPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 sm:p-12 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8" />
                </div>

                <h1 className="text-xl font-extrabold text-slate-900 mb-2">
                    Aguardando Vínculo Hospitalar
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                    Sua conta ainda não foi vinculada a nenhum hospital.
                    Entre em contato com o <strong className="text-slate-700">gestor</strong> para
                    que ele adicione seu e-mail à unidade hospitalar correta.
                </p>

                <button
                    onClick={() => router.push("/logout")}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
}
