import React from "react";
import type { LucideIcon } from "lucide-react";

export type KpiTone = "blue" | "emerald" | "indigo" | "amber" | "red";

type ToneStyles = {
    iconBg: string;
    iconText: string;
    valueText: string;
    cardHover: string;
};

const TONE_STYLES: Record<KpiTone, ToneStyles> = {
    blue: {
        iconBg: "bg-blue-50",
        iconText: "text-blue-600",
        valueText: "text-slate-800",
        cardHover: "hover:border-blue-100",
    },
    emerald: {
        iconBg: "bg-emerald-50",
        iconText: "text-emerald-600",
        valueText: "text-emerald-600",
        cardHover: "hover:border-emerald-100",
    },
    indigo: {
        iconBg: "bg-indigo-50",
        iconText: "text-indigo-600",
        valueText: "text-indigo-600",
        cardHover: "hover:border-indigo-100",
    },
    amber: {
        iconBg: "bg-amber-50",
        iconText: "text-amber-600",
        valueText: "text-amber-600",
        cardHover: "hover:border-amber-100",
    },
    red: {
        iconBg: "bg-red-50",
        iconText: "text-red-600",
        valueText: "text-red-600",
        cardHover: "hover:border-red-100",
    },
};

type KpiCardProps = {
    label: string;
    value: string | number;
    unit?: string;
    icon: LucideIcon;
    tone?: KpiTone;
    hint?: string;
};

export default function KpiCard({
    label,
    value,
    unit,
    icon: Icon,
    tone = "blue",
    hint,
}: KpiCardProps) {
    const styles = TONE_STYLES[tone];

    return (
        <div
            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group transition-colors ${styles.cardHover}`}
        >
            <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {label}
                </p>
                <h2 className={`text-4xl font-extrabold ${styles.valueText}`}>
                    {value}
                    {unit && (
                        <span className="text-xl text-slate-400 ml-1">{unit}</span>
                    )}
                </h2>
                {hint && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{hint}</p>
                )}
            </div>
            <div
                className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${styles.iconBg} ${styles.iconText}`}
            >
                <Icon className="w-8 h-8" />
            </div>
        </div>
    );
}
