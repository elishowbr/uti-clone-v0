"use client";

import React from "react";
import {
    FileText,
    Pill,
    Stethoscope,
    TestTube,
    UserPlus,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type QuickActionId =
    | "new-evolution"
    | "new-prescription"
    | "request-exam"
    | "clinical-note"
    | "admit-patient"
    | "view-patients";

type QuickAction = {
    id: QuickActionId;
    label: string;
    description: string;
    icon: LucideIcon;
};

const QUICK_ACTIONS: QuickAction[] = [
    {
        id: "new-evolution",
        label: "Iniciar evolução",
        description: "Registrar evolução clínica do paciente",
        icon: Stethoscope,
    },
    {
        id: "new-prescription",
        label: "Nova prescrição",
        description: "Renovar ou prescrever medicação",
        icon: Pill,
    },
    {
        id: "request-exam",
        label: "Solicitar exame",
        description: "Laboratoriais, imagem ou cultura",
        icon: TestTube,
    },
    {
        id: "clinical-note",
        label: "Nota clínica",
        description: "Registrar intercorrência ou conduta",
        icon: FileText,
    },
    {
        id: "admit-patient",
        label: "Admitir paciente",
        description: "Iniciar internação em leito vago",
        icon: UserPlus,
    },
    {
        id: "view-patients",
        label: "Pacientes da unidade",
        description: "Visão completa dos leitos ativos",
        icon: Users,
    },
];

type QuickActionsPanelProps = {
    onSelectAction: (action: QuickAction) => void;
};

export default function QuickActionsPanel({
    onSelectAction,
}: QuickActionsPanelProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                    Ações rápidas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Atalhos para o dia a dia clínico
                </p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            type="button"
                            onClick={() => onSelectAction(action)}
                            className="text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group"
                        >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-bold text-slate-800 mt-2.5">
                                {action.label}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                {action.description}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
