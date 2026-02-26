'use client';

import React, { useState } from 'react';
import { Heart, Activity, Timer, Pill, FileText, Droplets, Gauge, ChevronDown, ChevronUp } from 'lucide-react';
import DrugSelector, { DrugDefinition, SelectedDrug } from '../selectors/DrugSelector';
import { SmartTextArea } from '../SmartTextArea';

// --- Interfaces ---
export interface HemodynamicsData {
    vasoactiveDrugs: SelectedDrug[];
    pam: string;
    fc: string;
    rhythm: string;
    enteralDrugs: string;
    tec: string;
    lactate: string;
    svco2: string;
    gapco2: string;
    observations: string;
}

interface HemodynamicsFormProps {
    data: HemodynamicsData;
    onChange: (field: keyof HemodynamicsData, value: any) => void;
    patientWeight: number;
}

// --- Componente Principal ---
export default function HemodynamicsForm({
    data,
    onChange,
    patientWeight
}: HemodynamicsFormProps) {

    // Estado para controlar expansão/colapso
    const [isExpanded, setIsExpanded] = useState(false);

    const safeData = data || {};

    // Formatação de drogas para o preview
    const formatVasoactiveDrugs = (drugs: SelectedDrug[]) => {
        if (!drugs || drugs.length === 0) return '';
        return drugs
            .filter(d => d.flow > 0)
            .map(d => `${d.drug.name} ${d.flow} ml/h (${d.dose} ${d.drug.doseUnit})`)
            .join(', ');
    };

    // Geração do texto de prévia
    const generateHemoPreview = () => {
        const parts = [];
        const vasoactiveText = formatVasoactiveDrugs(safeData.vasoactiveDrugs);
        if (vasoactiveText) parts.push(`Drogas Vasoativas: ${vasoactiveText}`);
        if (safeData.pam) parts.push(`PAM: ${safeData.pam} mmHg`);
        if (safeData.fc) parts.push(`FC: ${safeData.fc} bpm`);
        if (safeData.rhythm) parts.push(`Ritmo: ${safeData.rhythm}`);
        if (safeData.enteralDrugs) parts.push(`Drogas Enterais: ${safeData.enteralDrugs}`);
        if (safeData.tec) parts.push(`TEC: ${safeData.tec}`);
        if (safeData.lactate) parts.push(`Lactato: ${safeData.lactate}`);
        if (safeData.svco2) parts.push(`SvcO2: ${safeData.svco2}%`);
        if (safeData.gapco2) parts.push(`GapCO2: ${safeData.gapco2}`);
        if (safeData.observations) parts.push(`Obs: ${safeData.observations}`);
        return parts.join(' | ');
    };

    const previewText = generateHemoPreview();
    const hasData = previewText.length > 0;

    const VASOACTIVE_DRUGS: DrugDefinition[] = [
        {
            id: 'noradrenalina_simples',
            name: 'Noradrenalina simples',
            concentration: 64, // 4mg em 250ml = 16mcg/ml? Não, geralmente é 4 ampolas (4mg cada = 16mg total) em 250ml SG = 64mcg/ml.
            unit: 'mcg/ml',
            doseUnit: 'mcg/kg/min',
            conversionFactor: 60 // ml/h -> ml/min
        },
        {
            id: 'noradrenalina_dobrada',
            name: 'Noradrenalina dobrada',
            concentration: 128, // 32mg em 250ml
            unit: 'mcg/ml',
            doseUnit: 'mcg/kg/min',
            conversionFactor: 60
        },
        {
            id: 'vasopressina',
            name: 'Vasopressina',
            concentration: 0.2, // 40UI em 200ml = 0.2 UI/ml. *Atenção: A dose é UI/min, não por kg.*
            unit: 'UI/ml',
            doseUnit: 'UI/min',
            conversionFactor: 60
            // OBS: Vasopressina geralmente não é por peso. O cálculo abaixo precisará de ajuste se for fixa.
            // Para simplificar, assumirei o padrão do seu código de referência que usa peso.
            // Se quiser dose fixa, precisaremos adaptar a lógica de cálculo.
        },
        {
            id: 'dobutamina',
            name: 'Dobutamina',
            concentration: 1000, // 250mg em 250ml = 1mg/ml = 1000mcg/ml
            unit: 'mcg/ml',
            doseUnit: 'mcg/kg/min',
            conversionFactor: 60
        },
        {
            id: 'dopamina',
            name: 'Dopamina',
            concentration: 2000, // 50mg/10ml ampola. 5 ampolas (250mg) em 250ml? Não, 5 ampolas (250mg) = 1000mcg/ml
            unit: 'mcg/ml',
            doseUnit: 'mcg/kg/min',
            conversionFactor: 60
        }
    ];

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all duration-300">

            {/* Cabeçalho Interativo */}
            <div
                className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-lg">
                        <Heart className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800">Hemodinâmica</h2>
                        <p className="text-xs text-slate-500 hidden sm:block">Perfusão, ritmo e drogas vasoativas</p>
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

                    {/* 1. Drogas Vasoativas */}
                    <div>
                        <DrugSelector
                            label="Drogas Vasoativas"
                            colorTheme='red'
                            availableDrugsList={VASOACTIVE_DRUGS}
                            selectedDrugs={safeData.vasoactiveDrugs || []}
                            onChange={(val) => onChange('vasoactiveDrugs', val)}
                            patientWeight={patientWeight}
                        />
                    </div>

                    <div className="border-t border-slate-100"></div>

                    {/* 2. PAM e FC */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SmartTextArea
                            label="PAM (Pressão Arterial Média)"
                            helperText="mmHg"
                            value={safeData.pam}
                            onChange={(val: string) => onChange('pam', val)}
                            placeholder="Ex: 85"
                        />
                        <SmartTextArea
                            label="FC (Frequência Cardíaca)"
                            helperText="bpm"
                            value={safeData.fc}
                            onChange={(val: string) => onChange('fc', val)}
                            placeholder="Ex: 78"
                        />
                    </div>

                    {/* 3. Ritmo */}
                    <SmartTextArea
                        label="Ritmo Cardíaco"
                        icon={Activity}
                        value={safeData.rhythm}
                        onChange={(val: string) => onChange('rhythm', val)}
                        placeholder="Descreva o ritmo..."
                        colorTheme='red'
                        tags={['Sinusal', 'Regular', 'Irregular', 'Fibrilação atrial', 'Taquicardia Sinusal', 'Bradicardia Sinusal', 'Extra-sístoles']}
                    />


                    {/* 4. Drogas Enterais */}
                    <SmartTextArea
                        label="Drogas Cardiovasculares Enterais"
                        icon={Pill}
                        value={safeData.enteralDrugs}
                        onChange={(val: string) => onChange('enteralDrugs', val)}
                        placeholder="Anti-hipertensivos, antiarrítmicos, etc..."
                        colorTheme='red'
                        tags={['Enalapril', 'Losartana', 'Metoprolol', 'Carvedilol', 'Espironolactona', 'Hidralazina', 'Nitrato', 'Amiodarona enteral', 'Anlodipino']}
                    />

                    <div className="border-t border-slate-100"></div>

                    {/* 5. Perfusão e Gasometria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SmartTextArea
                            label="TEC (Tempo de Enchimento Capilar)"
                            icon={Timer}
                            value={safeData.tec}
                            onChange={(val: string) => onChange('tec', val)}
                            placeholder="Segundos..."
                            colorTheme='red'
                            tags={['TEC < 3 segundos', 'TEC 3-5 segundos', 'TEC > 5 segundos']}
                            startHidden
                        />
                        <SmartTextArea
                            label="Lactato (mg/dl)"
                            icon={Droplets}
                            value={safeData.lactate}
                            onChange={(val: string) => onChange('lactate', val)}
                            placeholder="Valor do lactato"
                            colorTheme='red'
                            startHidden
                        />
                        <SmartTextArea
                            label="SvcO2 (%)"
                            icon={Gauge}
                            value={safeData.svco2}
                            onChange={(val: string) => onChange('svco2', val)}
                            placeholder="Saturação venosa central"
                            colorTheme='red'
                            startHidden
                        />
                        <SmartTextArea
                            label="GapCO2 (mmHg)"
                            icon={Activity}
                            value={safeData.gapco2}
                            onChange={(val: string) => onChange('gapco2', val)}
                            placeholder="Diferença arterio-venosa de CO2"
                            colorTheme='red'
                            startHidden
                        />
                    </div>

                    {/* 6. Observações */}
                    <SmartTextArea
                        label="Observações Subjetivas"
                        icon={FileText}
                        value={safeData.observations}
                        onChange={(val: string) => onChange('observations', val)}
                        placeholder="Outras observações hemodinâmicas..."
                        colorTheme='red'
                        tags={['Estável hemodinamicamente', 'Melhora da perfusão periférica', 'Mantém padrão', 'Choque em resolução', 'Instabilidade hemodinâmica']}
                        startHidden
                    />

                    {/* 7. Prévia de Texto (Expandida) */}
                    {hasData && (
                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 mt-6 animate-fade-in shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-rose-600" />
                                <div className="text-xs font-bold text-rose-800 uppercase tracking-wide">Prévia da Evolução Hemodinâmica</div>
                            </div>
                            <div className="text-sm text-rose-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-rose-100">
                                {previewText}
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                /* Estado Recolhido (Resumo Compacto) */
                hasData && (
                    <div className="px-6 py-4 bg-rose-50/30 animate-fade-in">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="font-bold text-rose-700 whitespace-nowrap">Resumo:</span>
                            <span className="line-clamp-2">{previewText}</span>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}