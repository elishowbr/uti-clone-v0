"use client";

import React from "react";
import { Clock, ShieldCheck } from "lucide-react";

export type DoctorWelcomeProps = {
    name: string;
    initials: string;
    crm: string;
    position: string;
};

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
}

export default function DoctorWelcome({ name, initials, crm, position }: DoctorWelcomeProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xl shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            {getGreeting()}
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                            {name}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">
                            {position}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {crm === "—" ? "Nível de Acesso" : "Registro Profissional"}
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {crm === "—" ? "Gestão Hospitalar" : `CRM ${crm}`}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Sessão ativa
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
