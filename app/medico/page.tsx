'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity,
    ArrowRight,
    CalendarCheck,
    ClipboardList,
    Loader2,
    Stethoscope,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    getDoctorProfileForPanel,
    getDoctorKpis,
    getDoctorRecentActivity,
    getAllUtiPatients,
    type DoctorProfile,
    type DoctorKpis,
    type DoctorEvolution,
    type UtiPatient,
} from '../actions/doctorData';
import EvolutionDetailModal from './components/EvolutionDetailModal';

// ─── KPI Card ────────────────────────────────────────────────────────────────

type KpiTone = 'blue' | 'emerald' | 'indigo' | 'amber';

function KpiCard({
    label,
    value,
    icon: Icon,
    tone,
    hint,
}: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    tone: KpiTone;
    hint?: string;
}) {
    const colors: Record<KpiTone, { bg: string; text: string; iconBg: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    };
    const c = colors[tone];
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
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

function RecentEvoItem({
    evo,
    onClick,
}: {
    evo: DoctorEvolution;
    onClick: () => void;
}) {
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
                <p className="text-[11px] text-slate-400 mt-1">
                    {date.toLocaleDateString('pt-BR')} às{' '}
                    {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
        </button>
    );
}

// ─── Patient Row ──────────────────────────────────────────────────────────────

function PatientRow({ patient, onEvolve }: { patient: DoctorPatient; onEvolve: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        !patient.isActive
                            ? 'bg-slate-100 text-slate-400'
                            : patient.evolvedTodayByDoctor
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-amber-100 text-amber-600'
                    }`}
                >
                    <Stethoscope className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500">
                        {patient.bedLabel} &middot; {patient.daysInUTI} dia{patient.daysInUTI > 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
                <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${
                        !patient.isActive
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : patient.evolvedTodayByDoctor
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}
                >
                    {!patient.isActive ? 'Alta' : patient.evolvedTodayByDoctor ? 'Evoluído' : 'Pendente'}
                </span>
                {patient.isActive && patient.bedId && (
                    <button
                        onClick={onEvolve}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-blue-200"
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Evoluir
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MedicoDashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [kpis, setKpis] = useState<DoctorKpis | null>(null);
    const [recentEvos, setRecentEvos] = useState<DoctorEvolution[]>([]);
    const [patients, setPatients] = useState<UtiPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvo, setSelectedEvo] = useState<DoctorEvolution | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [prof, kpiData, evos, pats] = await Promise.all([
                    getDoctorProfileForPanel(),
                    getDoctorKpis(),
                    getDoctorRecentActivity(6),
                    getAllUtiPatients(),
                ]);
                setProfile(prof);
                setKpis(kpiData);
                setRecentEvos(evos);
                setPatients(pats.slice(0, 5));
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
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
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
        <div className="space-y-8 pb-10">
            {/* ── Welcome Banner ── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/30" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/20" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-blue-200 text-sm mb-1 capitalize">{today}</p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold">
                            {greeting},{' '}
                            <span className="text-blue-100">
                                {profile?.name ?? 'Médico'}
                            </span>
                        </h1>
                        <p className="text-blue-200 text-sm mt-1">
                            {profile?.crm} &middot; {profile?.position}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── KPIs ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <KpiCard
                    label="Pacientes esta Semana"
                    value={kpis?.patientsThisWeek ?? 0}
                    icon={Users}
                    tone="emerald"
                    hint="Últimos 7 dias"
                />
            </section>

            {/* ── Content Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Meus Pacientes (Resumo) */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Meus Pacientes</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pacientes que você atende atualmente
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/medico/patients')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Ver todos <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {patients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Users className="w-10 h-10 mb-3 opacity-40" />
                                    <p className="font-medium text-sm">Nenhum paciente internado</p>
                                    <p className="text-xs mt-1">A UTI está vazia no momento.</p>
                                </div>
                            ) : (
                                patients.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                p.evolvedTodayByCurrentDoctor ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                <Stethoscope className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {p.bedLabel} &middot; {p.daysInUTI} dia{p.daysInUTI > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border shrink-0 ml-3 ${
                                            p.evolvedTodayByCurrentDoctor
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                            {p.evolvedTodayByCurrentDoctor ? 'Evoluído' : 'Pendente'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Atividade Recente */}
                <div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Últimas Evoluções</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Registradas por você</p>
                            </div>
                            <button
                                onClick={() => router.push('/medico/evolutions')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Ver histórico <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="p-3 space-y-1 max-h-[420px] overflow-y-auto">
                            {recentEvos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                    <ClipboardList className="w-8 h-8 mb-2 opacity-40" />
                                    <p className="text-sm font-medium">Nenhuma evolução recente</p>
                                </div>
                            ) : (
                                recentEvos.map((evo) => (
                                    <RecentEvoItem
                                        key={evo.id}
                                        evo={evo}
                                        onClick={() => setSelectedEvo(evo)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <EvolutionDetailModal
                evolution={selectedEvo}
                onClose={() => setSelectedEvo(null)}
            />
        </div>
    );
}
