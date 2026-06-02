"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export type UserProfileData = {
    id: number;
    name: string;
    email: string;
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
                <div className="w-28 h-3.5 bg-slate-200 rounded" />
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-2xl transition-all duration-200 outline-none select-none"
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-100 shrink-0">
                    {profile.initials}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                    {profile.email}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {profile.initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Usuário</p>
                            <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                {profile.email}
                            </p>
                        </div>
                    </div>

                    <div className="p-2">
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
