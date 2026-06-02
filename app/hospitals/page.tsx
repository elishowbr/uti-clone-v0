"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Activity, AlertCircle, Building2, CheckCircle2,
    Loader2, MapPin, Search, X, LayoutDashboard,
} from "lucide-react";
import { getHospitals, type HospitalData } from "@/app/actions/adminData";

type HospitalStatus = "stable" | "warning" | "critical";

function getStatus(data: HospitalData): HospitalStatus {
    if (data.totalBeds === 0) return "stable";
    const rate = (data.occupiedBeds / data.totalBeds) * 100;
    if (rate >= 90) return "critical";
    if (rate >= 70) return "warning";
    return "stable";
}

const STATUS_CONFIG = {
    stable: {
        icon: "bg-emerald-100 text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        label: "Normal",
        dot: "bg-emerald-500",
    },
    warning: {
        icon: "bg-amber-100 text-amber-600",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        label: "Atenção",
        dot: "bg-amber-500",
    },
    critical: {
        icon: "bg-rose-100 text-rose-600",
        badge: "bg-rose-100 text-rose-700 border-rose-200",
        label: "Crítico",
        dot: "bg-rose-500",
    },
};

function HospitalCard({ hospital, onSelect }: { hospital: HospitalData; onSelect: () => void }) {
    const status = getStatus(hospital);
    const cfg = STATUS_CONFIG[status];
    const occupancyPct = hospital.totalBeds > 0
        ? Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)
        : 0;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-100 hover:shadow-md transition-all flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.icon}`}>
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate leading-tight">{hospital.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{hospital.address}</span>
                        </p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                </span>
            </div>

            {hospital.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{hospital.description}</p>
            )}

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                    <div className="font-extrabold text-slate-800 text-base">{hospital.totalBeds}</div>
                    <div className="text-slate-400 font-medium">Total</div>
                </div>
                <div>
                    <div className="font-extrabold text-blue-600 text-base">{hospital.occupiedBeds}</div>
                    <div className="text-slate-400 font-medium">Ocupados</div>
                </div>
                <div>
                    <div className="font-extrabold text-emerald-600 text-base">{hospital.vacantBeds}</div>
                    <div className="text-slate-400 font-medium">Livres</div>
                </div>
            </div>

            {hospital.totalBeds > 0 && (
                <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Ocupação</span>
                        <span>{occupancyPct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                occupancyPct >= 90 ? "bg-rose-500" : occupancyPct >= 70 ? "bg-amber-400" : "bg-emerald-500"
                            }`}
                            style={{ width: `${occupancyPct}%` }}
                        />
                    </div>
                </div>
            )}

            <button
                onClick={onSelect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
                <LayoutDashboard className="w-4 h-4" /> Acessar Dashboard
            </button>
        </div>
    );
}

export default function HospitalsPage() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getHospitals()
            .then(setHospitals)
            .finally(() => setLoading(false));
    }, []);

    const filtered = hospitals.filter(
        h =>
            h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.address.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Rede Hospitalar</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Selecione uma unidade para acessar o painel de controle e gestão de leitos
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar unidade por nome ou endereço..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Carregando rede hospitalar...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Building2 className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-bold text-slate-600 text-base">
                        {search ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}
                    </p>
                    <p className="text-sm mt-1 text-center max-w-xs">
                        {search
                            ? "Tente outro termo de busca."
                            : "Peça ao gestor para cadastrar unidades no painel administrativo."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(h => (
                        <HospitalCard
                            key={h.id}
                            hospital={h}
                            onSelect={() => router.push(`/${h.id}/dashboard`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
