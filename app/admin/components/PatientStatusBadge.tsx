import React from "react";
import type { PatientStatus } from "../lib/mockData";

type StatusStyles = {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
};

const STATUS_STYLES: Record<PatientStatus, StatusStyles> = {
    CRITICAL: {
        label: "Crítico",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
        dot: "bg-red-500",
    },
    OBSERVATION: {
        label: "Observação",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        dot: "bg-amber-500",
    },
    STABLE: {
        label: "Estável",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        dot: "bg-blue-500",
    },
    IMPROVING: {
        label: "Melhora",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        dot: "bg-emerald-500",
    },
};

export default function PatientStatusBadge({
    status,
}: {
    status: PatientStatus;
}) {
    const styles = STATUS_STYLES[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${styles.color} ${styles.bg} ${styles.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            {styles.label}
        </span>
    );
}
