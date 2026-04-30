"use client";

import React from "react";
import { ArrowRight, Building2, Calendar, Star } from "lucide-react";
import { useHospital } from "./HospitalContext";
import type { HospitalLink } from "../lib/mockData";

function formatOccupancy(hospital: HospitalLink): string {
    const rate = Math.round((hospital.bedsOccupied / hospital.bedsTotal) * 100);
    return `${hospital.bedsOccupied}/${hospital.bedsTotal} leitos · ${rate}% ocupação`;
}

export default function HospitalsPanel() {
    const { hospitals, selectedHospital, selectHospital } = useHospital();

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        Hospitais vinculados ao seu CRM
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Selecione para alternar o contexto de trabalho
                    </p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {hospitals.length} unidades
                </span>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {hospitals.map((hospital) => {
                    const isActive = hospital.id === selectedHospital.id;
                    return (
                        <button
                            key={hospital.id}
                            type="button"
                            onClick={() => selectHospital(hospital.id)}
                            className={`text-left p-4 rounded-2xl border transition-all group ${
                                isActive
                                    ? "border-blue-200 bg-blue-50/40 shadow-sm"
                                    : "border-slate-100 hover:border-blue-100 hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div
                                    className={`p-2.5 rounded-xl ${
                                        isActive
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <Building2 className="w-5 h-5" />
                                </div>
                                {hospital.isPrimary && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                        <Star className="w-3 h-3" /> Principal
                                    </span>
                                )}
                            </div>

                            <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                {hospital.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {hospital.city} - {hospital.state}
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="text-xs">
                                    <span className="text-slate-400">Função: </span>
                                    <span className="font-semibold text-slate-700">
                                        {hospital.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    {hospital.shifts}
                                </div>
                                <div className="text-xs font-medium text-slate-600">
                                    {formatOccupancy(hospital)}
                                </div>
                            </div>

                            <div
                                className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${
                                    isActive
                                        ? "text-blue-700"
                                        : "text-slate-400 group-hover:text-blue-600"
                                }`}
                            >
                                {isActive ? "Em uso agora" : "Trabalhar nesta unidade"}
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
