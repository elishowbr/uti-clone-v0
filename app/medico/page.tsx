'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity, ArrowRight, Building2, CalendarCheck, ChevronLeft, ChevronRight,
    ClipboardList, ExternalLink, LayoutDashboard, Loader2, MapPin,
    Search, Stethoscope, TrendingUp, Users, X, Zap,
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
    { id: 'hospitals',  label: 'Meus Hospitais', icon: Building2       },
    { id: 'history',    label: 'Histórico',       icon: ClipboardList   },
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

// ─── Tab 2: Meus Hospitais ────────────────────────────────────────────────────

function statusFromPct(pct: number): 'stable' | 'warning' | 'critical' {
    if (pct >= 90) return 'critical';
    if (pct >= 70) return 'warning';
    return 'stable';
}

const HOSPITAL_COLORS = {
    stable:   { icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    warning:  { icon: 'bg-amber-100  text-amber-600',   bar: 'bg-amber-400',   badge: 'bg-amber-100  text-amber-700  border-amber-200'  },
    critical: { icon: 'bg-rose-100   text-rose-600',    bar: 'bg-rose-500',    badge: 'bg-rose-100   text-rose-700   border-rose-200'   },
};
const HOSPITAL_LABELS = { stable: 'Normal', warning: 'Atenção', critical: 'Crítico' };

function HospitalCard({ hospital, onAccess }: { hospital: DoctorHospital; onAccess: () => void }) {
    const pct = hospital.totalBeds > 0
        ? Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)
        : 0;
    const status = statusFromPct(pct);
    const colors = HOSPITAL_COLORS[status];

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-blue-100 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                    <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-800 truncate">{hospital.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${colors.badge}`}>
                            {HOSPITAL_LABELS[status]}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{hospital.address}</span>
                    </p>
                </div>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                    <span>Ocupação</span>
                    <span className="font-bold">{hospital.occupiedBeds}/{hospital.totalBeds} leitos</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>{hospital.vacantBeds} livres</span>
                    <span>{pct}% ocupado</span>
                </div>
            </div>

            <button
                onClick={onAccess}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
                <LayoutDashboard className="w-3.5 h-3.5" /> Acessar Dashboard
            </button>
        </div>
    );
}

function TabHospitals({ hospitals, onAccess }: { hospitals: DoctorHospital[]; onAccess: (id: number) => void }) {
    const [search, setSearch] = useState('');
    const filtered = hospitals.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou endereço..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Building2 className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-semibold text-slate-600">
                        {search ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
                    </p>
                    <p className="text-sm mt-1 text-slate-400">
                        {search ? 'Tente outro termo.' : 'Solicite ao gestor para cadastrar unidades.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(h => (
                        <HospitalCard key={h.id} hospital={h} onAccess={() => onAccess(h.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Tab 3: Histórico de Evolução ─────────────────────────────────────────────

const PERIOD_OPTIONS = [
    { label: '7 dias',  value: 7   },
    { label: '30 dias', value: 30  },
    { label: '90 dias', value: 90  },
];

function TabHistory({ onEvoClick }: { onEvoClick: (evo: DoctorEvolution) => void }) {
    const [evolutions, setEvolutions] = useState<DoctorEvolution[]>([]);
    const [total, setTotal]           = useState(0);
    const [page, setPage]             = useState(1);
    const [search, setSearch]         = useState('');
    const [period, setPeriod]         = useState(30);
    const [loading, setLoading]       = useState(true);

    const PAGE_SIZE = 15;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const load = useCallback(async (p: number, s: string, days: number) => {
        setLoading(true);
        const res = await getDoctorEvolutions(p, s, days);
        setEvolutions(res.data);
        setTotal(res.total);
        setLoading(false);
    }, []);

    useEffect(() => { load(page, search, period); }, [page, period, load]);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
        load(1, val, period);
    };

    const handlePeriod = (val: number) => {
        setPeriod(val);
        setPage(1);
        load(1, search, val);
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por paciente..."
                        defaultValue={search}
                        onChange={e => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                    {PERIOD_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handlePeriod(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                period === opt.value
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Evoluções Registradas</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {total} registro{total !== 1 ? 's' : ''} nos últimos {period} dias
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Carregando...</span>
                    </div>
                ) : evolutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm font-medium">Nenhuma evolução encontrada</p>
                        <p className="text-xs mt-1">Tente ampliar o período ou limpar a busca.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        <th className="text-left px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paciente</th>
                                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leito</th>
                                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data</th>
                                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hora</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {evolutions.map(evo => {
                                        const d = new Date(evo.createdAt);
                                        return (
                                            <tr key={evo.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-3.5 font-medium text-slate-800 truncate max-w-[200px]">
                                                    {evo.patientName}
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-500">{evo.bedLabel}</td>
                                                <td className="px-4 py-3.5 text-slate-500">
                                                    {d.toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-500">
                                                    {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <button
                                                        onClick={() => onEvoClick(evo)}
                                                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        Ver <ExternalLink className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile list */}
                        <div className="sm:hidden divide-y divide-slate-50">
                            {evolutions.map(evo => {
                                const d = new Date(evo.createdAt);
                                return (
                                    <button
                                        key={evo.id}
                                        onClick={() => onEvoClick(evo)}
                                        className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 text-left transition-colors"
                                    >
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                            <Stethoscope className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{evo.patientName}</p>
                                            <p className="text-xs text-slate-500">{evo.bedLabel}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {d.toLocaleDateString('pt-BR')} às{' '}
                                                {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-xs text-slate-400">
                                    Página {page} de {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    onClick={() => router.push('/hospitals')}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all text-left"
                >
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Todas as Unidades</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ver e selecionar hospitais</p>
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
                        <p className="text-sm font-bold text-slate-800">Histórico Completo</p>
                        <p className="text-xs text-slate-500 mt-0.5">Todas as suas evoluções</p>
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
                    {activeTab === 'hospitals' && (
                        <TabHospitals
                            hospitals={hospitals}
                            onAccess={id => router.push(`/${id}/dashboard`)}
                        />
                    )}
                    {activeTab === 'history' && (
                        <TabHistory onEvoClick={setSelectedEvo} />
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
