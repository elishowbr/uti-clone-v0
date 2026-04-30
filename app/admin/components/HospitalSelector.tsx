"use client";

import React, { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useHospital } from "./HospitalContext";

export default function HospitalSelector() {
    const { selectedHospital, hospitals, selectHospital } = useHospital();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        function handleEsc(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen]);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-slate-50 transition-all min-w-[260px] shadow-sm"
            >
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Hospital ativo
                    </div>
                    <div className="text-sm font-bold text-slate-800 truncate">
                        {selectedHospital.shortName}
                    </div>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute top-full mt-2 right-0 left-0 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 z-30 p-1.5 animate-in fade-in zoom-in-95"
                >
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
                        Hospitais vinculados ao seu CRM
                    </div>
                    {hospitals.map((hospital) => {
                        const isActive = hospital.id === selectedHospital.id;
                        return (
                            <button
                                key={hospital.id}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => {
                                    selectHospital(hospital.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <div
                                    className={`p-1.5 rounded-md ${
                                        isActive
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm leading-tight truncate">
                                        {hospital.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {hospital.role} · {hospital.city} -{" "}
                                        {hospital.state}
                                    </div>
                                </div>
                                {isActive && (
                                    <Check className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
