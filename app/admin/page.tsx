"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Stethoscope,
    Users,
} from "lucide-react";
import ActivityFeed from "./components/ActivityFeed";
import DoctorWelcome from "./components/DoctorWelcome";
import HospitalsPanel from "./components/HospitalsPanel";
import KpiCard from "./components/KpiCard";
import QuickActionsPanel from "./components/QuickActionsPanel";
import TodayPatientsCard from "./components/TodayPatientsCard";
import { useHospital } from "./components/HospitalContext";
import {
    getActivitiesByHospital,
    getPatientsByHospital,
    type DailyPatient,
} from "./lib/mockData";

type ToastState = {
    title: string;
    message: string;
} | null;

const TOAST_TIMEOUT_MS = 3000;

function buildKpis(patients: DailyPatient[]) {
    const total = patients.length;
    const critical = patients.filter((p) => p.status === "CRITICAL").length;
    const pendingEvolutions = patients.filter(
        (p) => p.hasPendingEvolution,
    ).length;
    const stable = patients.filter(
        (p) => p.status === "STABLE" || p.status === "IMPROVING",
    ).length;
    return { total, critical, pendingEvolutions, stable };
}

export default function AdminDashboardPage() {
    const { selectedHospital } = useHospital();
    const [toast, setToast] = useState<ToastState>(null);

    const patients = useMemo(
        () => getPatientsByHospital(selectedHospital.id),
        [selectedHospital.id],
    );
    const activities = useMemo(
        () => getActivitiesByHospital(selectedHospital.id),
        [selectedHospital.id],
    );
    const kpis = useMemo(() => buildKpis(patients), [patients]);
    const occupancyRate = Math.round(
        (selectedHospital.bedsOccupied / selectedHospital.bedsTotal) * 100,
    );

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), TOAST_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const handleSelectPatient = (patient: DailyPatient) => {
        setToast({
            title: "Evolução iniciada",
            message: `${patient.name} (${patient.bedLabel}) — protótipo de UI.`,
        });
    };

    const handleQuickAction = (action: { label: string }) => {
        setToast({
            title: action.label,
            message: "Ação registrada no protótipo. Integração real em desenvolvimento.",
        });
    };

    return (
        <div className="space-y-8">
            <DoctorWelcome />

            <HospitalsPanel />

            <section
                aria-label="Indicadores do médico"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
            >
                <KpiCard
                    label="Pacientes sob cuidado"
                    value={kpis.total}
                    icon={Users}
                    tone="blue"
                    hint={`${selectedHospital.shortName}`}
                />
                <KpiCard
                    label="Evoluções pendentes"
                    value={kpis.pendingEvolutions}
                    icon={Stethoscope}
                    tone="amber"
                    hint="Para registrar hoje"
                />
                <KpiCard
                    label="Pacientes críticos"
                    value={kpis.critical}
                    icon={AlertCircle}
                    tone="red"
                    hint="Necessitam reavaliação imediata"
                />
                <KpiCard
                    label="Ocupação da unidade"
                    value={occupancyRate}
                    unit="%"
                    icon={Activity}
                    tone="indigo"
                    hint={`${selectedHospital.bedsOccupied}/${selectedHospital.bedsTotal} leitos`}
                />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <TodayPatientsCard
                        patients={patients}
                        onSelectPatient={handleSelectPatient}
                    />
                </div>
                <div className="space-y-6">
                    <QuickActionsPanel onSelectAction={handleQuickAction} />
                    <ActivityFeed activities={activities} />
                </div>
            </div>

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
                            <div className="text-sm font-bold">
                                {toast.title}
                            </div>
                            <div className="text-xs text-slate-300 mt-0.5">
                                {toast.message}
                            </div>
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
