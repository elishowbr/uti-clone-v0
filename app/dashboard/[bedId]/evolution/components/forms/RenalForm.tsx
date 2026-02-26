'use client';

import React, { useState } from 'react';
import { Droplets, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { SmartTextArea } from '../SmartTextArea';

// --- Interfaces ---
export interface RenalData {
    diuresis: string;
    diuretics: string;
    glycemia: string;
    balance: string;
    dialysis: string;
    insulin: string;
    observations: string;
    corticoidUse: boolean;
}

interface RenalFormProps {
    data: RenalData;
    onChange: (field: keyof RenalData, value: any) => void;
}


// --- Componente Principal ---
export default function RenalForm({ data, onChange }: RenalFormProps) {
    // Estado para controle do Acordeão
    const [isExpanded, setIsExpanded] = useState(false);

    const safeData = data || {};

    // Gerar prévia textual
    const generatePreview = () => {
        const parts = [];
        if (safeData.diuresis) parts.push(`Diurese: ${safeData.diuresis}`);
        if (safeData.balance) parts.push(`BH: ${safeData.balance}`);
        if (safeData.diuretics) parts.push(`Diuréticos: ${safeData.diuretics}`);
        if (safeData.dialysis) parts.push(`TRS: ${safeData.dialysis}`);
        if (safeData.glycemia) parts.push(`Glicemia: ${safeData.glycemia}`);
        if (safeData.insulin) parts.push(`Insulina: ${safeData.insulin}`);
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
                    <div className="bg-yellow-100 p-2 rounded-lg">
                        <Droplets className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800">Renal/Metabólico</h2>
                        <p className="text-xs text-slate-500 hidden sm:block">Diurese, função renal e controle glicêmico</p>
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
                        {/* Diurese */}
                        <SmartTextArea
                            label="Diurese"
                            value={safeData.diuresis}
                            onChange={(val: string) => onChange('diuresis', val)}
                            placeholder="Volume e características..."
                            tags={['Diurese adequada > 1 ml/kg/h', 'Oligúria 0,3-0,5 ml/kg/h', 'Anúria < 0,3 ml/kg/h', '/12h', '/24h']}
                            colorTheme='amber'
                        />

                        {/* Balanço Hídrico */}
                        <SmartTextArea
                            label="Balanço Hídrico"
                            value={safeData.balance}
                            onChange={(val: string) => onChange('balance', val)}
                            placeholder="Resultado do BH..."
                            tags={['Subquantificado', 'Positivo', 'Negativo', 'Equilibrado', '/12h', '/24h']}
                            colorTheme='amber'
                        />

                        {/* Uso de Diuréticos */}
                        <SmartTextArea
                            label="Uso de Diuréticos"
                            value={safeData.diuretics}
                            onChange={(val: string) => onChange('diuretics', val)}
                            placeholder="Diuréticos em uso..."
                            tags={['Furosemida enteral', 'Furosemida IV', 'Hidroclorotiazida', 'Espironolactona', 'Sem diuréticos']}
                            colorTheme='amber'
                        />

                        {/* Terapia de Substituição Renal */}
                        <SmartTextArea
                            label="Modalidade de Terapia de Substituição Renal e UF"
                            value={safeData.dialysis}
                            onChange={(val: string) => onChange('dialysis', val)}
                            placeholder="Modalidade..."
                            tags={['Intermitente', 'SLED', 'Contínua', 'CVVH', 'CVVHDF', 'Sem TRS']}
                            colorTheme='amber'
                        />

                        {/* Glicemias */}
                        <SmartTextArea
                            label="Glicemias"
                            value={safeData.glycemia}
                            onChange={(val: string) => onChange('glycemia', val)}
                            placeholder="Controle glicêmico..."
                            tags={['Glicemias na meta', 'Picos glicêmicos', 'Episódios de hipoglicemia']}
                            colorTheme='amber'
                        />

                        {/* Insulinoterapia */}
                        <SmartTextArea
                            label="Insulinoterapia em uso"
                            value={safeData.insulin}
                            onChange={(val: string) => onChange('insulin', val)}
                            placeholder="Insulinas..."
                            tags={['Insulina regular', 'Insulina NPH', 'Insulina glargina', 'Insulina asparte', 'Insulina lispro', 'Insulina bic']}
                            colorTheme='amber'
                        />
                    </div>

                    {/* Observações - Full Width */}
                    <SmartTextArea
                        label="Observações Renal/Metabólico"
                        icon={FileText}
                        value={safeData.observations}
                        onChange={(val: string) => onChange('observations', val)}
                        placeholder="Outras observações..."
                        tags={['Sem alterações', 'Melhora progressiva', 'Necessita ajuste medicamentoso', 'Estável no momento']}
                        colorTheme='amber'
                        startHidden
                    />

                    {/* Preview Expandido */}
                    {hasData && (
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-6 animate-fade-in shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-yellow-600" />
                                <div className="text-xs font-bold text-yellow-800 uppercase tracking-wide">Prévia da Evolução Renal/Metabólica</div>
                            </div>
                            <div className="text-sm text-yellow-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-yellow-100">
                                {previewText}
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                /* Estado Recolhido (Resumo Compacto) */
                hasData && (
                    <div className="px-6 py-4 bg-yellow-50/30 animate-fade-in">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="font-bold text-yellow-700 whitespace-nowrap">Resumo:</span>
                            <span className="line-clamp-2">{previewText}</span>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}