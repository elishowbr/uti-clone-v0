"use client";

import React from "react";
import {
    AlertCircle,
    Pill,
    Stethoscope,
    TestTube,
    UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityEntry, ActivityKind } from "../lib/mockData";

type KindStyle = {
    icon: LucideIcon;
    iconBg: string;
    iconText: string;
};

const KIND_STYLES: Record<ActivityKind, KindStyle> = {
    EVOLUTION: {
        icon: Stethoscope,
        iconBg: "bg-blue-50",
        iconText: "text-blue-600",
    },
    PRESCRIPTION: {
        icon: Pill,
        iconBg: "bg-indigo-50",
        iconText: "text-indigo-600",
    },
    EXAM: {
        icon: TestTube,
        iconBg: "bg-emerald-50",
        iconText: "text-emerald-600",
    },
    ADMISSION: {
        icon: UserPlus,
        iconBg: "bg-amber-50",
        iconText: "text-amber-600",
    },
    ALERT: {
        icon: AlertCircle,
        iconBg: "bg-red-50",
        iconText: "text-red-600",
    },
};

function formatRelative(isoLike: string): string {
    const diffMs = Date.now() - new Date(isoLike).getTime();
    const minutes = Math.round(diffMs / (1000 * 60));
    if (minutes < 1) return "Agora";
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    const days = Math.floor(hours / 24);
    return `há ${days} d`;
}

export default function ActivityFeed({
    activities,
}: {
    activities: ActivityEntry[];
}) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                    Atividade recente
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Eventos clínicos das últimas horas
                </p>
            </div>
            {activities.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">
                    Sem atividades nesta unidade.
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {activities.map((activity) => {
                        const styles = KIND_STYLES[activity.kind];
                        const Icon = styles.icon;
                        return (
                            <li
                                key={activity.id}
                                className="px-6 py-3.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
                            >
                                <div
                                    className={`p-2 rounded-lg shrink-0 ${styles.iconBg} ${styles.iconText}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-slate-800 truncate">
                                            {activity.title}
                                        </span>
                                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                            {formatRelative(activity.occurredAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                        {activity.description}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
