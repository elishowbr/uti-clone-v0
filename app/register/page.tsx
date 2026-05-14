"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * RegisterPage — Tela de criação de conta do UTI Care.
 *
 * Por ora esta é uma tela de protótipo visual baseada no design Figma.
 * O submit exibe uma mensagem de "funcionalidade em desenvolvimento",
 * pois o backend de registro ainda não está implementado no domínio Prisma.
 *
 * Para implementar o backend:
 *   1. Criar server action `app/actions/auth.ts#register`
 *   2. Modelar User ↔ Doctor/Nurse no schema Prisma
 *   3. Usar bcrypt para hash da senha antes de salvar no DB
 */
export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field-level error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    }

    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!form.fullName.trim()) next.fullName = "Nome completo é obrigatório.";
        if (!form.email.trim()) {
            next.email = "E-mail é obrigatório.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            next.email = "Formato de e-mail inválido.";
        }
        if (!form.password) {
            next.password = "Senha é obrigatória.";
        } else if (form.password.length < 8) {
            next.password = "A senha deve ter pelo menos 8 caracteres.";
        }
        if (!form.confirmPassword) {
            next.confirmPassword = "Confirme sua senha.";
        } else if (form.password !== form.confirmPassword) {
            next.confirmPassword = "As senhas não coincidem.";
        }
        if (!acceptedTerms) {
            next.terms = "Você deve aceitar os termos para continuar.";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        // Simulate async (replace with real server action call)
        await new Promise((r) => setTimeout(r, 1200));
        setIsSubmitting(false);
        setSuccess(true);
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
                {success ? (
                    /* ── Success state ── */
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Solicitação recebida!
                        </h2>
                        <p className="text-slate-500 leading-relaxed">
                            O cadastro de novos usuários está em desenvolvimento. Sua solicitação foi
                            registrada e você será notificado quando o sistema estiver disponível.
                        </p>
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium">
                            🚧 Funcionalidade em desenvolvimento — use as credenciais de demonstração por
                            enquanto.
                        </div>
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 text-sm"
                        >
                            Ir para o Login
                        </Link>
                    </div>
                ) : (
                    /* ── Register form ── */
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

                        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
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
                                    value={form.fullName}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    aria-invalid={!!errors.fullName}
                                    aria-describedby={errors.fullName ? "error-fullname" : undefined}
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                        errors.fullName
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                                />
                                {errors.fullName && (
                                    <p id="error-fullname" className="mt-1.5 text-xs text-red-600">
                                        {errors.fullName}
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
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "error-email" : undefined}
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                        errors.email
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                                />
                                {errors.email && (
                                    <p id="error-email" className="mt-1.5 text-xs text-red-600">
                                        {errors.email}
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
                                        placeholder="Insira sua senha"
                                        value={form.password}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? "error-password" : undefined}
                                        className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                            errors.password
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
                                {errors.password && (
                                    <p id="error-password" className="mt-1.5 text-xs text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="register-confirm"
                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                >
                                    Senha <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="register-confirm"
                                        name="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Insira sua senha"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        aria-invalid={!!errors.confirmPassword}
                                        aria-describedby={errors.confirmPassword ? "error-confirm" : undefined}
                                        className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm placeholder:text-slate-400 disabled:opacity-60 ${
                                            errors.confirmPassword
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
                                {errors.confirmPassword && (
                                    <p id="error-confirm" className="mt-1.5 text-xs text-red-600">
                                        {errors.confirmPassword}
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
                                            if (errors.terms) setErrors((p) => ({ ...p, terms: "" }));
                                        }}
                                        disabled={isSubmitting}
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
                                {errors.terms && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.terms}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                id="register-submit"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none text-sm mt-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Criando conta…
                                    </>
                                ) : (
                                    "Acessar Conta"
                                )}
                            </button>

                            {/* OAuth hint (visual-only, matches Figma) */}
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="uppercase tracking-wider font-medium">ou registre-se com</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            <div className="flex justify-center gap-3">
                                {/* Google */}
                                <button
                                    type="button"
                                    aria-label="Registrar com Google"
                                    title="Em breve"
                                    className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                </button>
                                {/* Facebook */}
                                <button
                                    type="button"
                                    aria-label="Registrar com Facebook"
                                    title="Em breve"
                                    className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" aria-hidden>
                                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* ── Footer ── */}
            <footer className="bg-slate-900 text-slate-400 py-5 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    <span>© {new Date().getFullYear()} UTI Care. Todos os direitos reservados.</span>
                    <div className="flex items-center gap-4">
                        {/* Social icons */}
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
