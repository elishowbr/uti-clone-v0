'use client';

import React, { useState } from 'react';
import { Wind, Activity, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import RespiratorySupportSelector, { SelectedRespiratorySupport } from '../selectors/RespiratorySupportSelector';
import { SmartTextArea } from '../SmartTextArea';

// --- Interface Atualizada ---
export interface RespiratoryData {
    airwayType: 'fisiologica' | 'tot' | 'tqt';
    supports: SelectedRespiratorySupport[];
    spo2: string;
    sao2: string;
    observations: string;
    chestXray: string;
}

interface RespiratoryFormProps {
    data: RespiratoryData;
    onChange: (field: keyof RespiratoryData, value: any) => void;
}

// --- Componente Principal ---
export default function RespiratoryForm({
    data,
    onChange
}: RespiratoryFormProps) {

    // Estado para controle do Acordeão
    const [isExpanded, setIsExpanded] = useState(false);

    // Fallback seguro
    const safeData = data || { airwayType: 'fisiologica', supports: [] };
    const isArtificialAirway = safeData.airwayType !== 'fisiologica';

    // Handler específico para mudança de via aérea
    const handleAirwayChange = (type: 'fisiologica' | 'tot' | 'tqt') => {
        if (type === 'fisiologica') {
            onChange('supports', []);
        }
        onChange('airwayType', type);
    };

    // Formatação de Suportes
    const formatSupports = (supports: SelectedRespiratorySupport[]) => {
        if (!supports || supports.length === 0) return 'Ar ambiente';
        return supports.map(s => {
            let text = s.support.name;
            if (s.support.parameterType === 'vm_params' && s.vmParameters) {
                const params = [];
                if (s.vmParameters.fio2) params.push(`FiO2 ${s.vmParameters.fio2}%`);
                if (s.vmParameters.peep) params.push(`PEEP ${s.vmParameters.peep}`);
                if (s.vmParameters.ps) params.push(`PS ${s.vmParameters.ps}`);
                if (s.vmParameters.pc) params.push(`PC ${s.vmParameters.pc}`);
                if (params.length > 0) text += ` (${params.join(', ')})`;
            } else if (s.value) {
                text += ` ${s.value}${s.support.unit ? ' ' + s.support.unit : '%'}`;
            }
            return text;
        }).join(' + ');
    };

    // Geração da Prévia
    const generatePreview = () => {
        const parts = [];
        if (safeData.airwayType !== 'fisiologica') {
            parts.push(safeData.airwayType === 'tot' ? 'TOT' : 'TQT');
        }
        const supportText = formatSupports(safeData.supports);
        if (supportText) parts.push(supportText);
        if (safeData.spo2) parts.push(`SpO2: ${safeData.spo2}%`);
        if (safeData.sao2) parts.push(`SaO2: ${safeData.sao2}%`);
        if (safeData.observations) parts.push(`Obs: ${safeData.observations}`);
        if (safeData.chestXray) parts.push(`RX: ${safeData.chestXray}`);
        return parts.join(' | ');
    };

    const previewText = generatePreview();
    const hasData = previewText.length > 0 && previewText !== 'Ar ambiente'; // Consideramos "Ar ambiente" padrão como "sem dados" relevantes para resumo se não houver mais nada

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">

            {/* Cabeçalho Interativo */}
            <div
                className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Wind className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800">Sistema Respiratório</h2>
                        <p className="text-xs text-slate-500 hidden sm:block">Parâmetros ventilatórios e observações clínicas</p>
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

                    {/* 1. Seleção de Via Aérea */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Tipo de Via Aérea</label>
                        <div className="flex flex-wrap gap-4">
                            {['fisiologica', 'tot', 'tqt'].map((type) => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="airwayType"
                                            value={type}
                                            checked={safeData.airwayType === type}
                                            onChange={() => handleAirwayChange(type as any)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                                    </div>
                                    <span className={`capitalize text-sm font-medium transition-colors ${safeData.airwayType === type ? 'text-blue-700 font-bold' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                        {type === 'tot' ? 'TOT (Tubo Orotraqueal)' : type === 'tqt' ? 'TQT (Traqueostomia)' : 'Via Aérea Fisiológica'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 2. Alerta Visual */}
                    {isArtificialAirway && (
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                Paciente com via aérea artificial. Selecione os parâmetros de ventilação mecânica abaixo.
                            </div>
                        </div>
                    )}

                    {/* 3. Seletor de Suporte */}
                    <div className="animate-fade-in">
                        <RespiratorySupportSelector
                            selectedSupports={safeData.supports || []}
                            onChange={(val) => onChange('supports', val)}
                            isArtificialAirway={isArtificialAirway}
                            airwayType={safeData.airwayType === 'tot' ? 'TOT' : safeData.airwayType === 'tqt' ? 'TQT' : ''}
                            vcRatios={[]}
                        />
                    </div>

                    <div className="border-t border-slate-100"></div>

                    {/* 4. Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 flex justify-between">
                                <span>Saturação de Pulso (SpO₂)</span>
                                <span className="text-slate-400 font-normal text-xs">%</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={safeData.spo2 || ''}
                                    onChange={(e) => onChange('spo2', e.target.value)}
                                    placeholder="Ex: 98"
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                />
                                <Activity className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 flex justify-between">
                                <span>Saturação Arterial (SaO₂)</span>
                                <span className="text-slate-400 font-normal text-xs">Gasometria</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={safeData.sao2 || ''}
                                    onChange={(e) => onChange('sao2', e.target.value)}
                                    placeholder="Ex: 97"
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                />
                                <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* 5. TextAreas Inteligentes */}
                    <div className="space-y-6">
                        <SmartTextArea
                            label="Radiografia de Tórax"
                            value={safeData.chestXray || ''}
                            onChange={(val: string) => onChange('chestXray', val)}
                            placeholder="Laudo resumido..."
                            tags={['Sem alterações agudas', 'Infiltrado bilateral', 'Condensação em base D', 'Condensação em base E', 'Derrame pleural', 'Congestão pulmonar', 'Melhora radiológica']}
                            icon={Activity}
                            colorTheme='blue'
                            startHidden
                        />

                        <SmartTextArea
                            label="Observações Subjetivas"
                            value={safeData.observations || ''}
                            onChange={(val: string) => onChange('observations', val)}
                            placeholder="Descreva o padrão respiratório..."
                            tags={['Eupnéico', 'Dispnéico', 'Taquipnéico', 'Murmúrio Vesicular Presente', 'Roncos', 'Sibilos', 'Estertores', 'Confortável', 'Tiragem intercostal']}
                            icon={FileText}
                            colorTheme='blue'
                            startHidden
                        />
                    </div>

                    {/* 6. Prévia de Texto Expandida */}
                    {hasData && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-6 animate-fade-in shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">Prévia da Evolução Respiratória</div>
                            </div>
                            <div className="text-sm text-blue-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-blue-100">
                                {previewText}
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                /* Estado Recolhido (Resumo Compacto) */
                hasData && (
                    <div className="px-6 py-4 bg-blue-50/30 animate-fade-in">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="font-bold text-blue-700 whitespace-nowrap">Resumo:</span>
                            <span className="line-clamp-2">{previewText}</span>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}