'use client';

import React, { useState } from 'react';
import { X, Stethoscope, Wind, Brain, Heart, Droplets, Apple, Microscope, Shield } from 'lucide-react';
import type { DoctorEvolution } from '../../actions/doctorData';

type Props = {
    evolution: DoctorEvolution | null;
    onClose: () => void;
};

type TabId = 'texto' | 'respiratorio' | 'neurologico' | 'hemodinamica' | 'renal' | 'nutricao' | 'hemato' | 'profilaxias';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'texto', label: 'Texto Gerado', icon: Stethoscope },
    { id: 'respiratorio', label: 'Resp.', icon: Wind },
    { id: 'neurologico', label: 'Neuro', icon: Brain },
    { id: 'hemodinamica', label: 'Hemodi.', icon: Heart },
    { id: 'renal', label: 'Renal', icon: Droplets },
    { id: 'nutricao', label: 'Nutri.', icon: Apple },
    { id: 'hemato', label: 'Hemato', icon: Microscope },
    { id: 'profilaxias', label: 'Profilax.', icon: Shield },
];

function Field({ label, value }: { label: string; value: unknown }) {
    if (!value && value !== 0) return null;
    const display =
        typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap break-words">
                {display}
            </p>
        </div>
    );
}

export default function EvolutionDetailModal({ evolution, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>('texto');

    if (!evolution) return null;

    const date = new Date(evolution.createdAt);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-2xl max-h-[90dvh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:fade-in sm:zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 truncate">
                            {evolution.patientName}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {evolution.bedLabel} &middot;{' '}
                            {date.toLocaleDateString('pt-BR')} às{' '}
                            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-4 pt-3 pb-0 border-b border-slate-100 shrink-0 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {activeTab === 'texto' && (
                        <div>
                            {evolution.generatedText ? (
                                <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                                    {evolution.generatedText}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-8">
                                    Texto de evolução não gerado para este registro.
                                </p>
                            )}
                        </div>
                    )}
                    {activeTab === 'respiratorio' && (
                        <div className="space-y-3">
                            <Field label="Via Aérea" value={evolution.airwayType} />
                            <Field label="Suporte Respiratório" value={evolution.respiratorySupport} />
                            <Field label="SpO₂" value={evolution.respiratorySpo2} />
                        </div>
                    )}
                    {activeTab === 'neurologico' && (
                        <div className="space-y-3">
                            <Field label="Sedação" value={evolution.neurologicSedation} />
                            <Field label="Escalas Neurológicas" value={evolution.neurologicScales} />
                        </div>
                    )}
                    {activeTab === 'hemodinamica' && (
                        <div className="space-y-3">
                            <Field label="Drogas Vasoativas" value={evolution.hemodynamicDrugs} />
                            <Field label="PAM" value={evolution.hemodynamicPam} />
                            <Field label="FC" value={evolution.hemodynamicFc} />
                        </div>
                    )}
                    {activeTab === 'renal' && (
                        <div className="space-y-3">
                            <Field label="Diurese" value={evolution.renalDiuresis} />
                            <Field label="Diálise" value={evolution.renalDialysis} />
                        </div>
                    )}
                    {activeTab === 'nutricao' && (
                        <div className="space-y-3">
                            <Field label="Suporte Nutricional" value={evolution.nutritionSupport} />
                        </div>
                    )}
                    {activeTab === 'hemato' && (
                        <div className="space-y-3">
                            <Field label="Antibióticos" value={evolution.hematoAntibiotics} />
                            <Field label="Temperatura" value={evolution.hematoTemperature} />
                        </div>
                    )}
                    {activeTab === 'profilaxias' && (
                        <div className="space-y-3">
                            <Field label="TEV" value={evolution.prophylaxisTev} />
                            <Field label="IBP" value={evolution.prophylaxisIbp} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
