"use client";

import React from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { MOCK_DOCTOR } from "../lib/mockData";
import { useHospital } from "./HospitalContext";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
}

export default function DoctorWelcome() {
    const { selectedHospital } = useHospital();

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xl shrink-0">
                        {MOCK_DOCTOR.initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            {getGreeting()}
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                            {MOCK_DOCTOR.name}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">
                            {MOCK_DOCTOR.position} ·{" "}
                            <span className="font-semibold text-slate-700">
                                {selectedHospital.shortName}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Registro
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {MOCK_DOCTOR.crm}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Plantão até
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {MOCK_DOCTOR.onCallUntil}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
