"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { getDoctorProfile, type AdminDoctorProfile } from "../../actions/adminData";
import UserProfileDropdown from "@/app/components/UserProfileDropdown";

type AdminTopBarProps = {
    onToggleSidebar: () => void;
};

export default function AdminTopBar({ onToggleSidebar }: AdminTopBarProps) {
    const [profile, setProfile] = useState<AdminDoctorProfile | null>(null);

    useEffect(() => {
        getDoctorProfile().then(setProfile);
    }, []);

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
                            Painel de Gestão Hospitalar
                        </h1>
                        <p className="text-xs text-slate-500 truncate">
                            Administração & Estratégia · {profile?.position ?? 'Carregando...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <div className="pl-3 border-l border-slate-100">
                        <UserProfileDropdown profile={profile} />
                    </div>
                </div>
            </div>
        </header>
    );
}
