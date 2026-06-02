"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Bed, Building2, LogOut, Loader2 } from "lucide-react";
import { getNurseHospitals, type NurseHospital } from "../../actions/adminData";

export default function NurseHospitaisPage() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState<NurseHospital[]>([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        getNurseHospitals().then(h => {
            setHospitals(h);
            setLoading(false);
            if (h.length === 0) router.replace("/sem-acesso");
            if (h.length === 1) router.replace(`/${h[0].id}/dashboard`);
        });
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top bar */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-extrabold text-slate-900 leading-tight">UTI Care</p>
                        <p className="text-[11px] text-slate-400">Painel de Enfermagem</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push("/logout")}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            Selecione seu Hospital
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Você tem acesso a {loading ? "..." : hospitals.length} unidade{hospitals.length !== 1 ? "s" : ""}. Escolha onde trabalhar hoje.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {hospitals.map(h => {
                                const pct = h.totalBeds > 0
                                    ? Math.round((h.occupiedBeds / h.totalBeds) * 100)
                                    : 0;
                                const barColor = pct >= 90
                                    ? "bg-rose-500"
                                    : pct >= 70
                                    ? "bg-amber-400"
                                    : "bg-emerald-500";

                                return (
                                    <button
                                        key={h.id}
                                        onClick={() => router.push(`/${h.id}/dashboard`)}
                                        className="w-full bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md rounded-2xl p-5 text-left transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-11 h-11 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-colors">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 truncate">{h.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate">{h.address}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="text-xs text-slate-500">
                                                        <span className="font-bold text-slate-700">{h.occupiedBeds}</span>/{h.totalBeds} leitos ocupados
                                                    </span>
                                                    {h.totalBeds > 0 && (
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${barColor}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
