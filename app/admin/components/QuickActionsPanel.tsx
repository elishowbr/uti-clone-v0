"use client";

import React from "react";
import {
    Activity,
    ClipboardList,
    UserCheck,
    Settings,
    FileSpreadsheet,
    TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type QuickActionId =
    | "audit-occupancy"
    | "permanent-report"
    | "manage-staff"
    | "bed-block"
    | "extract-reports"
    | "hospital-goals";

type QuickAction = {
    id: QuickActionId;
    label: string;
    description: string;
    icon: LucideIcon;
};

const QUICK_ACTIONS: QuickAction[] = [
    {
        id: "audit-occupancy",
        label: "Auditar Ocupação",
        description: "Histórico e giro de leitos da UTI",
        icon: Activity,
    },
    {
        id: "permanent-report",
        label: "Média de Permanência",
        description: "Tempo médio de internação e altas",
        icon: ClipboardList,
    },
    {
        id: "manage-staff",
        label: "Cadastrar Profissional",
        description: "Adicionar médicos e enfermeiros à equipe",
        icon: UserCheck,
    },
    {
        id: "bed-block",
        label: "Bloquear Leito",
        description: "Manutenção preventiva ou higienização extra",
        icon: Settings,
    },
    {
        id: "extract-reports",
        label: "Extrair Faturamento",
        description: "Exportar diárias, guias e despesas",
        icon: FileSpreadsheet,
    },
    {
        id: "hospital-goals",
        label: "Metas da Unidade",
        description: "Definir metas de giro e qualidade",
        icon: TrendingUp,
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
                    Ações de Gestão
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Atalhos estratégicos e administrativos
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
