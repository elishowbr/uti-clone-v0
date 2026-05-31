"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import {
    Activity,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
} from "lucide-react";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);
    const [showPassword, setShowPassword] = useState(false);

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
                        Portal Corporativo
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                        Controle total<br />
                        <span className="text-cyan-200">dos seus leitos.</span>
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-xs">
                        Plataforma integrada de alta segurança para equipes médicas e de enfermagem.
                    </p>

                    {/* Stat pills */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {[
                            { label: "Monitoramento contínuo", value: "24/7" },
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
                    © {new Date().getFullYear()} UTI Care. Todos os direitos reservados.
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
                                Acesso Restrito
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Insira suas credenciais corporativas autorizadas.
                            </p>
                        </div>

                        <div className="px-8 py-6 space-y-6">
                            {/* ── Form ── */}
                            <form action={formAction} className="space-y-5" noValidate>
                                
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="login-email"
                                        className="block text-sm font-medium text-slate-700 mb-1.5"
                                    >
                                        E-mail profissional
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="login-email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="username"
                                            placeholder="seu.email@hospital.com.br"
                                            disabled={isPending}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="login-password"
                                        className="block text-sm font-medium text-slate-700 mb-1.5"
                                    >
                                        Senha de acesso
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            disabled={isPending}
                                            className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm disabled:opacity-60"
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
