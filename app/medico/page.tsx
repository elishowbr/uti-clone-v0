'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity, ArrowRight, Building2, CalendarCheck, ChevronLeft, ChevronRight,
    ClipboardList, ExternalLink, LayoutDashboard, Loader2, MapPin,
    Search, Stethoscope, TrendingUp, Users, X, Zap, UserCircle
} from 'lucide-react';
import {
    getDoctorProfileForPanel,
    getDoctorKpis,
    getDoctorRecentActivity,
    getDoctorHospitals,
    getDoctorMainHospital,
    getDoctorEvolutions,
    type DoctorProfile,
    type DoctorKpis,
    type DoctorEvolution,
    type DoctorHospital,
} from '../actions/doctorData';
import EvolutionDetailModal from './components/EvolutionDetailModal';

// ─── Tab definition ───────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview',   label: 'Visão Geral',    icon: LayoutDashboard },
    { id: 'quick',      label: 'Acesso Rápido',  icon: Zap             },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

type KpiTone = 'blue' | 'emerald' | 'indigo' | 'amber';
const KPI_COLORS: Record<KpiTone, { bg: string; text: string; iconBg: string }> = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    iconBg: 'bg-blue-100'    },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  iconBg: 'bg-indigo-100'  },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100'   },
};

function KpiCard({
    label, value, icon: Icon, tone, hint,
}: {
    label: string; value: number; icon: React.ComponentType<{ className?: string }>;
    tone: KpiTone; hint?: string;
}) {
    const c = KPI_COLORS[tone];
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <h2 className={`text-4xl font-extrabold ${c.text}`}>{value}</h2>
                {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
            </div>
            <div className={`p-4 ${c.iconBg} ${c.text} rounded-2xl group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
        </div>
    );
}

// ─── Recent Evolution Row ─────────────────────────────────────────────────────

function RecentEvoItem({ evo, onClick }: { evo: DoctorEvolution; onClick: () => void }) {
    const date = new Date(evo.createdAt);
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
        >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{evo.patientName}</p>
                <p className="text-xs text-slate-500 truncate">{evo.bedLabel}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    {date.toLocaleDateString('pt-BR')} às{' '}
                    {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
        </button>
    );
}

// ─── Tab 1: Visão Geral ───────────────────────────────────────────────────────

function TabOverview({
    kpis, recentEvos, onEvoClick,
}: {
    kpis: DoctorKpis | null;
    recentEvos: DoctorEvolution[];
    onEvoClick: (evo: DoctorEvolution) => void;
}) {
    return (
        <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                <KpiCard
                    label="Pacientes Ativos"
                    value={kpis?.activePatients ?? 0}
                    icon={Users}
                    tone="emerald"
                    hint="Internados na UTI agora"
                />
                <KpiCard
                    label="Evoluções Hoje"
                    value={kpis?.evolutionsToday ?? 0}
                    icon={CalendarCheck}
                    tone="blue"
                    hint="Registradas no plantão atual"
                />
                <KpiCard
                    label="Evoluções no Mês"
                    value={kpis?.evolutionsThisMonth ?? 0}
                    icon={TrendingUp}
                    tone="indigo"
                    hint={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                />
            </section>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Últimas Evoluções</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Registradas por você — clique para ver detalhes</p>
                </div>
                <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
                    {recentEvos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <ClipboardList className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm font-medium">Nenhuma evolução registrada ainda</p>
                        </div>
                    ) : (
                        recentEvos.map(evo => (
                            <RecentEvoItem key={evo.id} evo={evo} onClick={() => onEvoClick(evo)} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Tab 4: Acesso Rápido ─────────────────────────────────────────────────────

function TabQuick({
    mainHospital, onGoToHospital,
}: {
    mainHospital: { id: number; name: string } | null;
    onGoToHospital: (id: number) => void;
}) {
    const router = useRouter();

    return (
        <div className="space-y-5 max-w-2xl">
            {/* Main hospital card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Hospital Principal</p>
                <h3 className="text-xl font-extrabold mb-0.5">
                    {mainHospital ? mainHospital.name : 'Nenhum hospital vinculado'}
                </h3>
                {mainHospital ? (
                    <p className="text-blue-200 text-sm mb-5">
                        Último hospital onde você registrou uma evolução
                    </p>
                ) : (
                    <p className="text-blue-200 text-sm mb-5">
                        Registre sua primeira evolução para vincular um hospital
                    </p>
                )}
                <button
                    onClick={() => mainHospital && onGoToHospital(mainHospital.id)}
                    disabled={!mainHospital}
                    className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-md"
                >
                    <Activity className="w-4 h-4" />
                    Ir para UTI — Gestão de Leitos
                    <ArrowRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Quick action links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                    onClick={() => router.push('/medico/hospitals')}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all text-left"
                >
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Meus Hospitais</p>
                        <p className="text-xs text-slate-500 mt-0.5">Hospitais designados a você</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                </button>

                <button
                    onClick={() => router.push('/medico/evolutions')}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all text-left"
                >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Histórico de Evoluções</p>
                        <p className="text-xs text-slate-500 mt-0.5">Todas as suas evoluções</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                </button>

                <button
                    onClick={() => router.push('/medico/perfil')}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all text-left"
                >
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                        <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Meus Dados</p>
                        <p className="text-xs text-slate-500 mt-0.5">Gerenciar perfil e registro</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MedicoDashboardPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<TabId>('overview');

    // Shared data (loaded once)
    const [profile,      setProfile]      = useState<DoctorProfile | null>(null);
    const [kpis,         setKpis]         = useState<DoctorKpis | null>(null);
    const [recentEvos,   setRecentEvos]   = useState<DoctorEvolution[]>([]);
    const [hospitals,    setHospitals]    = useState<DoctorHospital[]>([]);
    const [mainHospital, setMainHospital] = useState<{ id: number; name: string } | null>(null);
    const [loading,      setLoading]      = useState(true);

    const [selectedEvo, setSelectedEvo] = useState<DoctorEvolution | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [prof, kpiData, evos, hosps, mainH] = await Promise.all([
                    getDoctorProfileForPanel(),
                    getDoctorKpis(),
                    getDoctorRecentActivity(8),
                    getDoctorHospitals(),
                    getDoctorMainHospital(),
                ]);
                setProfile(prof);
                setKpis(kpiData);
                setRecentEvos(evos);
                setHospitals(hosps);
                setMainHospital(mainH);
            } catch (e) {
                console.error('Erro ao carregar painel do médico:', e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const today = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Carregando painel...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/30" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/20" />
                </div>
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm mb-1 capitalize">{today}</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold">
                        {greeting},{' '}
                        <span className="text-blue-100">{profile?.name ?? 'Médico'}</span>
                    </h1>
                    <p className="text-blue-200 text-sm mt-1">
                        {profile?.crm} &middot; {profile?.position}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <nav className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex-1 justify-center sm:justify-start sm:flex-none ${
                                    active
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/60'
                                }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === 'overview' && (
                        <TabOverview
                            kpis={kpis}
                            recentEvos={recentEvos}
                            onEvoClick={setSelectedEvo}
                        />
                    )}
                    {activeTab === 'quick' && (
                        <TabQuick
                            mainHospital={mainHospital}
                            onGoToHospital={id => router.push(`/${id}/dashboard`)}
                        />
                    )}
                </div>
            </div>

            {/* Evolution Detail Modal */}
            <EvolutionDetailModal
                evolution={selectedEvo}
                onClose={() => setSelectedEvo(null)}
            />
        </div>
    );
}
