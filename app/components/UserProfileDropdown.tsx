"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, Shield, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export type UserProfileData = {
    id: number;
    name: string;
    initials: string;
    crm: string;
    position: string;
};

type UserProfileDropdownProps = {
    profile: UserProfileData | null;
};

export default function UserProfileDropdown({ profile }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fecha ao clicar fora (UX: Essencial para menus flutuantes)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!profile) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-20 h-4 bg-slate-200 rounded" />
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            {/* Botão de ativação do Dropdown */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-2xl transition-all duration-200 outline-none select-none text-left"
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-100 shrink-0">
                    {profile.initials}
                </div>
                <div className="hidden sm:block min-w-0 pr-1">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                        {profile.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                        {profile.position}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Menu flutuante Dropdown (Premium UI) */}
            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Header Perfil */}
                    <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg mb-3 shadow-inner">
                            {profile.initials}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {profile.name}
                        </h4>
                        
                        {/* Pill de Categoria/Cargo */}
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                            <Shield className="w-3 h-3 text-blue-500" />
                            {profile.position}
                        </div>

                        {profile.crm && profile.crm !== "—" && (
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                {profile.crm}
                            </p>
                        )}
                    </div>

                    {/* Links de ações */}
                    <div className="p-2 space-y-1">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                // Futura página de configurações de perfil
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left text-xs font-medium"
                        >
                            <User className="w-4 h-4 text-slate-400" />
                            Configurações de Perfil
                            <span className="ml-auto text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Em breve</span>
                        </button>
                    </div>

                    {/* Área de Logout */}
                    <div className="p-2 border-t border-slate-100 bg-slate-50/60">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/logout");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all font-bold text-xs"
                        >
                            <LogOut className="w-4 h-4 text-red-500" />
                            Sair do Sistema
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}
