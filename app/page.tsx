"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Bed,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden">

      {/* --- Header / Navbar --- */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <Activity className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">UTI Care</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
          <a href="#sobre" className="hover:text-blue-600 transition-colors">Sobre</a>
          <a href="#suporte" className="hover:text-blue-600 transition-colors">Suporte</a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Login
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Acessar Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button (UX: Essencial para mobile) */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] z-40 bg-white/95 backdrop-blur-sm p-6 flex flex-col gap-6 border-b border-slate-200 animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-6 text-lg font-medium text-slate-600 text-center">
            <a href="#funcionalidades" onClick={() => setIsMobileMenuOpen(false)}>Funcionalidades</a>
            <a href="#sobre" onClick={() => setIsMobileMenuOpen(false)}>Sobre</a>
            <a href="#suporte" onClick={() => setIsMobileMenuOpen(false)}>Suporte</a>
          </nav>
          <div className="flex flex-col gap-3 mt-auto mb-8">
            <Link href="/login">
              <button className="w-full py-3 text-slate-600 font-semibold border border-slate-200 rounded-lg">Login</button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg">Acessar Dashboard</button>
            </Link>
          </div>
        </div>
      )}

      {/* --- Hero Section --- */}
      <main className="flex-1">
        <section className="relative py-20 lg:py-32 px-6 bg-gradient-to-b from-white via-blue-50/50 to-slate-50 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Fase de testes
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Controle total dos leitos.<br />
              {/* UI: Gradiente no texto para destaque */}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Decisões que salvam vidas.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Uma plataforma centralizada para médicos administradores acompanharem a ocupação,
              evolução clínica e status da UTI em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link prefetch href="/dashboard" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-blue-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg">
                  <LayoutDashboard className="w-5 h-5" />
                  Ir para a Dashboard
                </button>
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm hover:shadow-md">
                Ver Documentação
              </button>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        </section>

        {/* --- Features Grid --- */}
        <section id="funcionalidades" className="py-24 px-6 bg-white relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Projetado para a rotina médica</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">Ferramentas essenciais desenvolvidas para eliminar gargalos e garantir a gestão eficiente do plantão.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-lg transition-all duration-300 group cursor-default">
                <div className="w-14 h-14 bg-white border border-slate-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Bed className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Gestão de Leitos</h3>
                <p className="text-slate-600 leading-relaxed">
                  Visualização rápida de leitos livres, ocupados ou em manutenção. Mapa visual intuitivo da UTI em tempo real.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-100 hover:bg-cyan-50/30 hover:shadow-lg transition-all duration-300 group cursor-default">
                <div className="w-14 h-14 bg-white border border-slate-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Evolução Clínica</h3>
                <p className="text-slate-600 leading-relaxed">
                  Acompanhe o histórico do paciente, sinais vitais e prescrições diretamente na interface do leito sem papelada.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 hover:shadow-lg transition-all duration-300 group cursor-default">
                <div className="w-14 h-14 bg-white border border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Dados Seguros</h3>
                <p className="text-slate-600 leading-relaxed">
                  Arquitetura segura com criptografia de ponta a ponta, em conformidade com a LGPD e padrões de saúde.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/50 p-2 rounded-lg">
              <Activity className="text-blue-500 w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">UTI Care</span>
          </div>

          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>

          <p className="text-sm text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} UTI Care System.<br className="hidden md:block" /> Feito por médicos, para médicos.
          </p>
        </div>
      </footer>
    </div>
  );
}