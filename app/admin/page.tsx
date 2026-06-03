"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, Contact, LayoutDashboard, Loader2, ArrowRight } from "lucide-react";
import { getAdminKpis, type AdminKpis } from "../actions/adminData";

export default function AdminDashboardPage() {
    const [kpis, setKpis] = useState<AdminKpis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminKpis().then(data => {
            setKpis(data);
            setLoading(false);
        });
    }, []);

    const cards = [
        {
            title: "Hospitais e Leitos",
            description: "Gerencie as unidades hospitalares, visualize e crie novos leitos.",
            href: "/admin/hospitais",
            icon: Building2,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            hoverRing: "hover:ring-blue-500/20",
            stat: kpis ? `${kpis.bedsTotal} leitos no total` : "...",
        },
        {
            title: "Equipe Hospitalar",
            description: "Vincule médicos e enfermeiros aos hospitais específicos.",
            href: "/admin/equipe",
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            hoverRing: "hover:ring-emerald-500/20",
            stat: "Gerenciar acessos",
        },
        {
            title: "Funcionários",
            description: "Cadastre e remova usuários do sistema (médicos, gestores, etc).",
            href: "/admin/funcionarios",
            icon: Contact,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            hoverRing: "hover:ring-amber-500/20",
            stat: "Controle de perfis",
        }
    ];

    return (
        <div className="pb-10 space-y-8">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-slate-700" />
                    Dashboard de Administração
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Bem-vindo ao painel central. Escolha uma das áreas abaixo para gerenciar.
                </p>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Link key={idx} href={card.href} className={`block bg-white rounded-2xl p-6 border ${card.border} shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ring-2 ring-transparent ${card.hoverRing} group`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="p-2 text-slate-300 group-hover:text-slate-800 transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h2>
                            <p className="text-sm text-slate-500 mb-6">{card.description}</p>
                            
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg w-fit">
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                {card.stat}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* KPI Overview (Optional additional stats) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Visão Geral da Rede</h3>
                {loading ? (
                    <div className="flex items-center justify-center py-10 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Taxa de Ocupação</p>
                            <p className="text-2xl font-extrabold text-slate-800">{kpis?.occupancyRate ?? 0}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pacientes Ativos</p>
                            <p className="text-2xl font-extrabold text-blue-600">{kpis?.totalPatients ?? 0}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Leitos Livres</p>
                            <p className="text-2xl font-extrabold text-emerald-600">{kpis?.bedsVacant ?? 0}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Evoluções Hoje</p>
                            <p className="text-2xl font-extrabold text-purple-600">{kpis?.recentEvolutionsToday ?? 0}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
