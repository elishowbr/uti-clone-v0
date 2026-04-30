"use client";

import React from "react";
import { Bell, Menu } from "lucide-react";
import HospitalSelector from "./HospitalSelector";
import { MOCK_DOCTOR } from "../lib/mockData";

type AdminTopBarProps = {
    onToggleSidebar: () => void;
};

export default function AdminTopBar({ onToggleSidebar }: AdminTopBarProps) {
    return (
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                            Painel do Médico
                        </h1>
                        <p className="text-xs text-slate-500 truncate">
                            Operação clínica · {MOCK_DOCTOR.specialty}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <HospitalSelector />
                    <button
                        type="button"
                        title="Notificações"
                        aria-label="Notificações"
                        className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-100 rounded-xl transition-all"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
                        <div className="text-right">
                            <div className="text-sm font-bold text-slate-800 leading-tight">
                                {MOCK_DOCTOR.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {MOCK_DOCTOR.position}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {MOCK_DOCTOR.initials}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
