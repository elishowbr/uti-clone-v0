"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { getDoctorProfile, getCurrentUserRole } from "@/app/actions/adminData";
import UserProfileDropdown from "@/app/components/UserProfileDropdown";
import type { UserProfileData } from "@/app/components/UserProfileDropdown";

export default function HospitalsLayout({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([getDoctorProfile(), getCurrentUserRole()]).then(([p, role]) => {
            if (p) setProfile(p as UserProfileData);
            setUserRole(role);
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    {userRole === "DOCTOR" && (
                        <Link
                            href="/medico"
                            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors mr-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Painel Médico</span>
                        </Link>
                    )}
                    <Link href="/hospitals" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-extrabold text-slate-900 leading-tight">UTI Care</div>
                            <div className="text-[11px] text-slate-500">Rede Hospitalar</div>
                        </div>
                    </Link>
                </div>
                <UserProfileDropdown profile={profile} />
            </header>
            <main className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
