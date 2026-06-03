"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building2, LogOut, Users, X, Contact, Bed } from "lucide-react";
import { getDoctorProfile, type AdminDoctorProfile } from "../../actions/adminData";

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname() ?? "";
    const [profile, setProfile] = useState<AdminDoctorProfile | null>(null);

    useEffect(() => { getDoctorProfile().then(setProfile); }, []);

    const navItems = [
        { href: "/admin", label: "Hospitais",      icon: Building2 },
        { href: "/admin/equipe", label: "Equipe",  icon: Users     },
        { href: "/admin/funcionarios", label: "Funcionários", icon: Contact },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} aria-hidden />
            )}

            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:transform-none`}>

                {/* Logo */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-slate-900 leading-tight">UTI Care</div>
                            <div className="text-[11px] text-slate-500">Painel do Gestor</div>
                        </div>
                    </Link>
                    <button type="button" onClick={onClose} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                                {item.label}
                                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer: email + logout */}
                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gestor</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{profile?.email ?? "…"}</p>
                    </div>
                    <Link href="/logout" title="Sair"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <LogOut className="w-5 h-5" />
                    </Link>
                </div>
            </aside>
        </>
    );
}
