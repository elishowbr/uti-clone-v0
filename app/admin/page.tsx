"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertCircle,
    Bed,
    CheckCircle2,
    Loader2,
    Stethoscope,
    Users,
} from "lucide-react";
import DoctorWelcome from "./components/DoctorWelcome";
import KpiCard from "./components/KpiCard";
import QuickActionsPanel from "./components/QuickActionsPanel";
import {
    getDoctorProfile,
    getAdminKpis,
    getAdminPatients,
    getRecentActivity,
    type AdminDoctorProfile,
    type AdminKpis,
    type AdminPatient,
    type AdminActivity,
} from "../actions/adminData";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PatientRow({ patient, onSelect }: { patient: AdminPatient; onSelect: () => void }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    patient.hasPendingEvolution
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                }`}>
                    <Stethoscope className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500">
                        {patient.bedLabel} · {patient.daysInUTI} dia{patient.daysInUTI > 1 ? 's' : ''} de internação
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
                {patient.hasPendingEvolution ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
                        Pendente
                    </span>
                ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        Evoluído
                    </span>
                )}
            </div>
        </button>
    );
}

function ActivityItem({ activity }: { activity: AdminActivity }) {
    const kindConfig = {
        EVOLUTION: { icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-100' },
        ADMISSION: { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        DISCHARGE: { icon: Bed, color: 'text-amber-600', bg: 'bg-amber-100' },
    };
    const config = kindConfig[activity.kind] || kindConfig.EVOLUTION;
    const Icon = config.icon;
    const date = new Date(activity.occurredAt);

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className={`p-2 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                    {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastState = { title: string; message: string } | null;
const TOAST_TIMEOUT_MS = 3000;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const [doctorProfile, setDoctorProfile] = useState<AdminDoctorProfile | null>(null);
    const [kpis, setKpis] = useState<AdminKpis | null>(null);
    const [patients, setPatients] = useState<AdminPatient[]>([]);
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<ToastState>(null);

    // Carregar todos os dados do banco
    useEffect(() => {
        async function loadData() {
            try {
                const [profile, kpiData, patientData, activityData] = await Promise.all([
                    getDoctorProfile(),
                    getAdminKpis(),
                    getAdminPatients(),
                    getRecentActivity(8),
                ]);
                setDoctorProfile(profile);
                setKpis(kpiData);
                setPatients(patientData);
                setActivities(activityData);
            } catch (error) {
                console.error('Erro ao carregar dados do admin:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Toast auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), TOAST_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const handleSelectPatient = (patient: AdminPatient) => {
        setToast({
            title: "Paciente selecionado",
            message: `${patient.name} (${patient.bedLabel}) — navegue para evoluir.`,
        });
    };

    const handleQuickAction = (action: { label: string }) => {
        setToast({
            title: action.label,
            message: "Ação registrada. Integração completa em desenvolvimento.",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-slate-500 gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Carregando painel...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome */}
            {doctorProfile && (
                <DoctorWelcome
                    name={doctorProfile.name}
                    initials={doctorProfile.initials}
                    crm={doctorProfile.crm}
                    position={doctorProfile.position}
                />
            )}

            {/* KPIs */}
            {kpis && (
                <section
                    aria-label="Indicadores da unidade"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                >
                    <KpiCard
                        label="Pacientes internados"
                        value={kpis.totalPatients}
                        icon={Users}
                        tone="blue"
                        hint={`${kpis.bedsOccupied}/${kpis.bedsTotal} leitos`}
                    />
                    <KpiCard
                        label="Evoluções pendentes"
                        value={kpis.pendingEvolutions}
                        icon={Stethoscope}
                        tone="amber"
                        hint="Para registrar hoje"
                    />
                    <KpiCard
                        label="Evoluções hoje"
                        value={kpis.recentEvolutionsToday}
                        icon={Activity}
                        tone="emerald"
                        hint="Registradas nas últimas 24h"
                    />
                    <KpiCard
                        label="Ocupação da unidade"
                        value={kpis.occupancyRate}
                        unit="%"
                        icon={Bed}
                        tone="indigo"
                        hint={`${kpis.bedsVacant} vago${kpis.bedsVacant !== 1 ? 's' : ''} · ${kpis.bedsCleaning} em limpeza`}
                    />
                </section>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Patients List */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Pacientes Internados</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{patients.length} paciente{patients.length !== 1 ? 's' : ''} na unidade</p>
                            </div>
                            {patients.some(p => p.hasPendingEvolution) && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {patients.filter(p => p.hasPendingEvolution).length} pendente{patients.filter(p => p.hasPendingEvolution).length > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                            {patients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Users className="w-10 h-10 mb-3 opacity-40" />
                                    <p className="font-medium">Nenhum paciente internado</p>
                                    <p className="text-sm">A UTI está vazia no momento.</p>
                                </div>
                            ) : (
                                patients.map(patient => (
                                    <PatientRow
                                        key={patient.id}
                                        patient={patient}
                                        onSelect={() => handleSelectPatient(patient)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <QuickActionsPanel onSelectAction={handleQuickAction} />

                    {/* Activity Feed */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Atividade Recente</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Últimas evoluções registradas</p>
                        </div>
                        <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto">
                            {activities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <Activity className="w-8 h-8 mb-2 opacity-40" />
                                    <p className="text-sm font-medium">Nenhuma atividade recente</p>
                                </div>
                            ) : (
                                activities.map(activity => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            <aside
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center px-4 z-50"
            >
                {toast && (
                    <div className="pointer-events-auto bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/30 px-5 py-3 flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold">{toast.title}</div>
                            <div className="text-xs text-slate-300 mt-0.5">{toast.message}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="text-slate-400 hover:text-white text-xs font-bold ml-2"
                            aria-label="Fechar notificação"
                        >
                            ×
                        </button>
                    </div>
                )}
            </aside>
        </div>
    );
}
