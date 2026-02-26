'use client';

import React, { useState } from 'react';
import { Thermometer, FileText, Activity, ChevronDown, ChevronUp, Pill, TestTube } from 'lucide-react';
import AntibioticsSelector, { Antibiotic } from '../selectors/AntibioticsSelector';
import CulturesSelector, { Culture } from '../selectors/CulturesSelector';
import { SmartTextArea } from '../SmartTextArea';

// --- Interfaces ---
export interface HematoinfectiousData {
    antibiotics: Antibiotic[];
    cultures: Culture[];
    temperature: string;
    biomarkers: string;
    corticoids: string;
    observations: string;
}

interface HematoinfectiousFormProps {
    data: HematoinfectiousData;
    onChange: (field: keyof HematoinfectiousData, value: any) => void;
}


export default function HematoinfectiousForm({ data, onChange }: HematoinfectiousFormProps) {
    // Estado para controle do Acordeão
    const [isExpanded, setIsExpanded] = useState(false);

    const safeData = data || {};

    // Funções auxiliares de formatação
    const formatAntibiotics = (antibiotics: Antibiotic[]) => {
        if (!antibiotics || antibiotics.length === 0) return '';
        return antibiotics.map(a => {
            const diffDays = Math.ceil((new Date().getTime() - new Date(a.startDate).getTime()) / (1000 * 3600 * 24));
            return `${a.name} (D${Math.max(0, diffDays)})`;
        }).join(', ');
    };

    const formatCultures = (cultures: Culture[]) => {
        if (!cultures || cultures.length === 0) return '';
        return cultures.filter(c => c.material).map(c => `${c.material} (${c.sensitivity || 'Pendente'})`).join(', ');
    };

    // Gerar prévia textual
    const generatePreview = () => {
        const parts = [];
        const abxText = formatAntibiotics(safeData.antibiotics);
        if (abxText) parts.push(`ATB: ${abxText}`);

        const culturesText = formatCultures(safeData.cultures);
        if (culturesText) parts.push(`Culturas: ${culturesText}`);

        if (safeData.temperature) parts.push(`Temp: ${safeData.temperature}`);
        if (safeData.biomarkers) parts.push(`Biomarcadores: ${safeData.biomarkers}`);
        if (safeData.corticoids) parts.push(`Corticoide: ${safeData.corticoids}`);
        if (safeData.observations) parts.push(`Obs: ${safeData.observations}`);

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
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800">Hematoinfeccioso</h2>
                        <p className="text-xs text-slate-500 hidden sm:block">Antibióticos, culturas e curva térmica</p>
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

                    {/* 1. Antibióticos */}
                    <AntibioticsSelector
                        selectedAntibiotics={safeData.antibiotics || []}
                        onChange={(val) => onChange('antibiotics', val)}
                    />

                    <div className="border-t border-slate-100"></div>

                    {/* 2. Temperaturas e Biomarcadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SmartTextArea
                            label="Temperaturas"
                            value={safeData.temperature}
                            onChange={(val: string) => onChange('temperature', val)}
                            placeholder="Curva térmica nas últimas 24h..."
                            tags={['Afebril', 'Febre', 'Temperatura máxima de', 'Hipotermia']}
                            colorTheme='orange'
                        />
                        <SmartTextArea
                            label="Biomarcador"
                            value={safeData.biomarkers}
                            onChange={(val: string) => onChange('biomarkers', val)}
                            placeholder="PCR, Procalcitonina..."
                            tags={['PCR', 'Procalcitonina', 'em queda', 'em ascensão']}
                            colorTheme='orange'
                        />
                    </div>

                    {/* 3. Corticoide */}
                    <SmartTextArea
                        label="Uso de Corticoide"
                        value={safeData.corticoids}
                        onChange={(val: string) => onChange('corticoids', val)}
                        placeholder="Drogas e doses..."
                        tags={['Hidrocortisona', 'Metilprednisolona', 'Dexametasona', 'Prednisona', 'Prednisolona', 'Sem corticoide']}
                        colorTheme='orange'
                    />

                    <div className="border-t border-slate-100"></div>

                    {/* 4. Culturas */}
                    <CulturesSelector
                        selectedCultures={safeData.cultures || []}
                        onChange={(val) => onChange('cultures', val)}
                    />

                    <div className="border-t border-slate-100"></div>

                    {/* 5. Observações */}
                    <SmartTextArea
                        label="Observações da Evolução Hematológico e Infeccioso"
                        icon={FileText}
                        value={safeData.observations}
                        onChange={(val: string) => onChange('observations', val)}
                        placeholder="Outras observações..."
                        tags={['Sem alterações significativas', 'Melhora do quadro infeccioso', 'Mantém padrão', 'Em investigação']}
                        colorTheme='orange'
                    />

                    {/* 6. Preview Expandido */}
                    {hasData && (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mt-6 animate-fade-in shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-orange-600" />
                                <div className="text-xs font-bold text-orange-800 uppercase tracking-wide">Prévia da Evolução Hematoinfecciosa</div>
                            </div>
                            <div className="text-sm text-orange-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-orange-100">
                                {previewText}
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                /* Estado Recolhido (Resumo Compacto) */
                hasData && (
                    <div className="px-6 py-4 bg-orange-50/30 animate-fade-in">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="font-bold text-orange-700 whitespace-nowrap">Resumo:</span>
                            <span className="line-clamp-2">{previewText}</span>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}