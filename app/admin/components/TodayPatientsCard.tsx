"use client";

import React from "react";
import { AlertCircle, Bed as BedIcon, Stethoscope } from "lucide-react";
import PatientStatusBadge from "./PatientStatusBadge";
import type { DailyPatient } from "../lib/mockData";

type TodayPatientsCardProps = {
    patients: DailyPatient[];
    onSelectPatient: (patient: DailyPatient) => void;
};

function formatTime(isoLike: string): string {
    return new Date(isoLike).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function calculateLengthOfStay(admissionIso: string): string {
    const ms = Date.now() - new Date(admissionIso).getTime();
    const days = Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
    return `${days}º dia`;
}

export default function TodayPatientsCard({
    patients,
    onSelectPatient,
}: TodayPatientsCardProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                        Pacientes do dia
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Lista priorizada por gravidade nesta unidade
                    </p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {patients.length} pacientes
                </span>
            </div>

            {patients.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">
                    Nenhum paciente sob seus cuidados nesta unidade.
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {patients.map((patient) => (
                        <li
                            key={patient.id}
                            className="px-6 py-4 hover:bg-slate-50/60 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shrink-0">
                                        <BedIcon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-800 truncate">
                                                {patient.name}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {patient.age} anos
                                            </span>
                                            <PatientStatusBadge status={patient.status} />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 truncate">
                                            {patient.bedLabel} ·{" "}
                                            {calculateLengthOfStay(patient.admissionDate)} ·
                                            última evolução {formatTime(patient.lastEvolutionAt)}
                                        </div>
                                        <div className="text-sm text-slate-700 mt-1.5 truncate">
                                            <Stethoscope className="w-3 h-3 text-blue-500 inline mr-1.5 -mt-0.5" />
                                            {patient.diagnosis}
                                        </div>
                                        {patient.alerts.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {patient.alerts.map((alert) => (
                                                    <span
                                                        key={alert}
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full"
                                                    >
                                                        <AlertCircle className="w-3 h-3" />
                                                        {alert}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {patient.hasPendingEvolution && (
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                            Evolução pendente
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onSelectPatient(patient)}
                                        className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-100 rounded-lg transition-colors"
                                    >
                                        Evoluir
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
