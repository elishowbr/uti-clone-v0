'use client';

import React, { useState } from 'react';
import { Utensils, CheckSquare, Scissors, Activity, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import NutritionSupportSelector, { SelectedNutritionSupport } from '../selectors/NutritionSupportSelector';
import { SmartTextArea } from '../SmartTextArea';

// --- Interfaces ---
export interface NutritionData {
    supports: SelectedNutritionSupport[];
    gastricResidue: string;
    prokineticsLaxatives: string;
    lastEvacuationDate: string;
    evacuationAspect: string;
    abdomen: string;
    isSurgical: boolean;
    drainsAspect: string;
    operativeWound: string;
}

interface NutritionFormProps {
    data: NutritionData;
    onChange: (field: keyof NutritionData, value: any) => void;
}

// --- Main Component ---
export default function NutritionForm({ data, onChange }: NutritionFormProps) {
    // Estado para controle do Acordeão
    const [isExpanded, setIsExpanded] = useState(false);

    const safeData = data || {};

    // Generate text preview
    const generatePreview = () => {
        const parts = [];

        // Supports
        if (safeData.supports?.length > 0) {
            const supportsText = safeData.supports.map(s => s.support.name).join(', ');
            parts.push(`Dieta: ${supportsText}`);
        } else {
            parts.push('Dieta: Zero/Suspensa');
        }

        // Evacuation
        if (safeData.lastEvacuationDate) {
            const evacuationDate = new Date(safeData.lastEvacuationDate);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - evacuationDate.getTime()) / (1000 * 3600 * 24));
            parts.push(`Evacuação: ${diffDays} dias atrás`);
        }

        if (safeData.evacuationAspect) parts.push(`Aspecto: ${safeData.evacuationAspect}`);
        if (safeData.gastricResidue) parts.push(`Resíduo: ${safeData.gastricResidue}`);
        if (safeData.abdomen) parts.push(`Abdome: ${safeData.abdomen}`);

        if (safeData.isSurgical) {
            parts.push(`P.O.: ${safeData.operativeWound || 'Sim'}`);
            if (safeData.drainsAspect) parts.push(`Drenos: ${safeData.drainsAspect}`);
        }

        return parts.join(' | ');
    };

    const previewText = generatePreview();
    const hasData = previewText.length > 0 && previewText !== 'Dieta: Zero/Suspensa'; // Consideramos "Zero/Suspensa" como padrão se não houver outros dados

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all duration-300">

            {/* Cabeçalho Interativo */}
            <div
                className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Utensils className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800">TGI/Nutrição</h2>
                        <p className="text-xs text-slate-500 hidden sm:block">Dieta, evacuações e aspecto abdominal</p>
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
                    {/* 1. Selector */}
                    <NutritionSupportSelector
                        selectedSupports={safeData.supports || []}
                        onChange={(val) => onChange('supports', val)}
                        gastricResidue={safeData.gastricResidue || ''}
                        onGastricResidueChange={(val) => onChange('gastricResidue', val)}
                        prokineticsLaxatives={safeData.prokineticsLaxatives || ''}
                        onProkineticsLaxativesChange={(val) => onChange('prokineticsLaxatives', val)}
                        lastEvacuationDate={safeData.lastEvacuationDate || ''}
                        onLastEvacuationDateChange={(val) => onChange('lastEvacuationDate', val)}
                        evacuationAspect={safeData.evacuationAspect || ''}
                        onEvacuationAspectChange={(val) => onChange('evacuationAspect', val)}
                    />

                    {/* 2. Abdomen */}
                    <div className="border-t border-slate-100"></div>
                    <SmartTextArea
                        label="Abdome"
                        value={safeData.abdomen}
                        onChange={(val: string) => onChange('abdomen', val)}
                        placeholder="Digite informações sobre abdome..."
                        tags={['Abdome flácido, RHA+', 'Abdome distendido', 'Abdome tenso', 'RHA ausentes']}
                    />

                    {/* 3. Surgical Section */}
                    <div className="border-t border-slate-100"></div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={safeData.isSurgical || false}
                                onChange={(e) => onChange('isSurgical', e.target.checked)}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                            />
                            <span className="font-bold text-slate-700 flex items-center gap-2">
                                <Scissors className="w-4 h-4" /> Paciente Cirúrgico
                            </span>
                        </label>

                        {safeData.isSurgical && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <SmartTextArea
                                    label="Drenos e Aspecto"
                                    value={safeData.drainsAspect}
                                    onChange={(val: string) => onChange('drainsAspect', val)}
                                    placeholder="Drenos..."
                                    tags={['Dreno de Blake com débito seroso', 'Dreno tubular com débito hemático', 'Sem drenos', 'Dreno de Penrose']}
                                />
                                <SmartTextArea
                                    label="Ferida Operatória"
                                    value={safeData.operativeWound}
                                    onChange={(val: string) => onChange('operativeWound', val)}
                                    placeholder="Ferida..."
                                    tags={['Ferida operatória limpa e seca', 'Ferida com discreto edema', 'Ferida com hiperemia', 'Ferida com secreção serosa']}
                                />
                            </div>
                        )}
                    </div>

                    {/* 4. Preview Expandido */}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-6 animate-fade-in shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <div className="text-xs font-bold text-green-800 uppercase tracking-wide">Prévia da Evolução Nutricional</div>
                        </div>
                        <div className="text-sm text-green-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-green-100">
                            {previewText}
                        </div>
                    </div>
                </div>
            ) : (
                /* Estado Recolhido (Resumo Compacto) */
                hasData && (
                    <div className="px-6 py-4 bg-green-50/30 animate-fade-in">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="font-bold text-green-700 whitespace-nowrap">Resumo:</span>
                            <span className="line-clamp-2">{previewText}</span>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}