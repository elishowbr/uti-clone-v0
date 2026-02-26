'use client';

import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { SmartTextArea } from '../SmartTextArea';

// --- Interfaces ---
export interface ProphylaxisData {
    anticoagulation: string;
    ibp: string;
    others: string;
}

interface ProphylaxisFormProps {
    data: ProphylaxisData;
    onChange: (field: keyof ProphylaxisData, value: any) => void;
}

// --- Main Component ---
export default function ProphylaxisForm({ data, onChange }: ProphylaxisFormProps) {
    // Estado para controle do Acordeão
    const [isExpanded, setIsExpanded] = useState(false);

    const safeData = data || {};

    // Gerar prévia textual
    const generatePreview = () => {
        const parts = [];
        if (safeData.anticoagulation) parts.push(`Profilaxia TEV: ${safeData.anticoagulation}`);
        if (safeData.ibp) parts.push(`Profilaxia Úlcera: ${safeData.ibp}`);
        if (safeData.others) parts.push(`Outros: ${safeData.others}`);
        return parts.join(' | ');
    };

    const previewText = generatePreview();
    const hasData = previewText.length > 0;

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all duration-300">

            {/* Cabeçalho Interativo */}
            <div
                className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800">Profilaxias</h2>
                        <p className="text-xs text-slate-500 hidden sm:block">TEV, úlcera de estresse e cuidados gerais</p>
                    </div>
                </div>

                <button
                    type="button"
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>

            {/* Conteúdo Expansível */}
            {isExpanded ? (
                <div className="p-4 md:p-6 space-y-8 animate-fade-in-down">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Anticoagulação/Profilaxia TEV */}
                        <SmartTextArea
                            label="Anticoagulação/Profilaxia TEV"
                            value={safeData.anticoagulation}
                            onChange={(val: string) => onChange('anticoagulation', val)}
                            placeholder="Digite informações sobre anticoagulação..."
                            tags={['Heparina 5000 UI 12/12h', 'Enoxaparina 40 mg/dia', 'Botas de compressão pneumática', 'Contraindicada']}
                            colorTheme='indigo'
                        />

                        {/* IBP */}
                        <SmartTextArea
                            label="IBP"
                            value={safeData.ibp}
                            onChange={(val: string) => onChange('ibp', val)}
                            placeholder="Profilaxia gástrica..."
                            tags={['Omeprazol 40 mg/dia', 'Omeprazol 40 mg 12/12h', 'Pantoprazol 40 mg/dia', 'Pantoprazol 40 mg 12/12h', 'Não indicado']}
                            colorTheme='indigo'
                        />
                    </div>

                    {/* Outros - Full Width */}
                    <SmartTextArea
                        label="Outros"
                        value={safeData.others}
                        onChange={(val: string) => onChange('others', val)}
                        placeholder="Outros cuidados profiláticos..."
                        tags={['Decúbito elevado 30°', 'Fisioterapia motora', 'Cuidados com pele', 'Mobilização precoce']}
                        colorTheme='indigo'
                    />

                    {/* Preview Expandido */}
                    {hasData && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mt-6 animate-fade-in shadow-sm">
                            <div className="text-xs font-bold text-indigo-800 mb-2 uppercase tracking-wide">Prévia das Profilaxias</div>
                            <div className="text-sm text-indigo-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-indigo-100">
                                {previewText}
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                /* Estado Recolhido (Resumo Compacto) */
                hasData && (
                    <div className="px-6 py-4 bg-indigo-50/30 animate-fade-in">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="font-bold text-indigo-700 whitespace-nowrap">Resumo:</span>
                            <span className="line-clamp-2">{previewText}</span>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}