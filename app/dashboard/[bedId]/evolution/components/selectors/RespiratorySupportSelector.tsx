'use client';

import React, { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';

// --- Interfaces Exportadas ---
export interface RespiratorySupport {
    id: string;
    name: string;
    parameterType: 'flow' | 'fio2' | 'none' | 'vm_params' | 'cpap' | 'bipap' | 'cnaf';
    unit: string;
    minValue?: number;
    maxValue?: number;
    placeholder?: string;
    vmParams?: string[];
}

export interface SelectedRespiratorySupport {
    support: RespiratorySupport;
    value: number;
    fr?: string;
    vmParameters?: {
        fio2?: string;
        peep?: string;
        pc?: string;
        vc?: string;
        ps?: string;
        fr_programmed?: string;
        fr_real?: string;
        vc_delivered?: string;
    };
    cpapParams?: {
        fio2?: string;
        epap?: string;
        fr?: string;
    };
    bipapParams?: {
        fio2?: string;
        ipap?: string;
        epap?: string;
        fr?: string;
    };
    cnafParams?: {
        flow?: string;
        fio2?: string;
        fr?: string;
    };
}

interface RespiratorySupportSelectorProps {
    selectedSupports: SelectedRespiratorySupport[];
    onChange: (supports: SelectedRespiratorySupport[]) => void;
    isArtificialAirway: boolean;
    airwayType: string;
    vcRatios?: Array<{ support: SelectedRespiratorySupport, ratio: number }>;
}

// --- Constantes de Configuração ---
const RESPIRATORY_SUPPORTS_NATURAL: RespiratorySupport[] = [
    {
        id: 'ar_ambiente',
        name: 'Ar ambiente',
        parameterType: 'none',
        unit: '',
    },
    {
        id: 'cateter_nasal',
        name: 'Cateter Nasal de O₂',
        parameterType: 'flow',
        unit: 'L/min',
        minValue: 1,
        maxValue: 6,
        placeholder: '1-6'
    },
    {
        id: 'mascara_venturi',
        name: 'Máscara Venturi',
        parameterType: 'fio2',
        unit: '%',
        minValue: 24,
        maxValue: 50,
        placeholder: '24-50'
    },
    {
        id: 'mascara_reservatorio',
        name: 'Máscara com Reservatório',
        parameterType: 'flow',
        unit: 'L/min',
        minValue: 10,
        maxValue: 15,
        placeholder: '10-15'
    },
    {
        id: 'cpap',
        name: 'CPAP',
        parameterType: 'cpap',
        unit: '',
    },
    {
        id: 'bipap',
        name: 'BIPAP',
        parameterType: 'bipap',
        unit: '',
    },
    {
        id: 'cnaf',
        name: 'CNAF',
        parameterType: 'cnaf',
        unit: '',
    }
];

const RESPIRATORY_SUPPORTS_ARTIFICIAL: RespiratorySupport[] = [
    {
        id: 'vm_pcv',
        name: 'VM em PCV',
        parameterType: 'vm_params',
        unit: '',
        vmParams: ['fio2', 'peep', 'pc', 'fr_programmed', 'fr_real', 'vc_delivered']
    },
    {
        id: 'vm_vcv',
        name: 'VM em VCV',
        parameterType: 'vm_params',
        unit: '',
        vmParams: ['fio2', 'peep', 'vc', 'fr_programmed', 'fr_real']
    },
    {
        id: 'vm_psv',
        name: 'VM em PSV',
        parameterType: 'vm_params',
        unit: '',
        vmParams: ['fio2', 'peep', 'ps', 'fr_real', 'vc_delivered']
    },
    {
        id: 'tqt_aa',
        name: 'TQT/AA',
        parameterType: 'none',
        unit: '',
    },
    {
        id: 'tqt_o2',
        name: 'TQT/O₂',
        parameterType: 'fio2',
        unit: '%',
        minValue: 21,
        maxValue: 100,
        placeholder: '21-100'
    }
];

export default function RespiratorySupportSelector({
    selectedSupports,
    onChange,
    isArtificialAirway,
    airwayType,
    vcRatios = []
}: RespiratorySupportSelectorProps) {
    const [showAddSupport, setShowAddSupport] = useState(false);

    const selectSupport = (support: RespiratorySupport) => {
        let newSupport: SelectedRespiratorySupport = {
            support,
            value: support.minValue || 0,
            fr: '' // Inicializa FR vazio para todos
        };

        if (support.parameterType === 'none') newSupport.value = 0;
        else if (support.parameterType === 'vm_params') newSupport.vmParameters = {};
        else if (support.parameterType === 'cpap') newSupport.cpapParams = {};
        else if (support.parameterType === 'bipap') newSupport.bipapParams = {};
        else if (support.parameterType === 'cnaf') newSupport.cnafParams = {};

        onChange([...selectedSupports, newSupport]);
        setShowAddSupport(false);
    };

    const removeSupport = (index: number) => {
        const updated = selectedSupports.filter((_, i) => i !== index);
        onChange(updated);
    };

    const updateValue = (index: number, value: number) => {
        const updated = [...selectedSupports];
        updated[index].value = value;
        onChange(updated);
    };

    const updateFr = (index: number, value: string) => {
        const updated = [...selectedSupports];
        updated[index].fr = value;
        onChange(updated);
    };

    // Helper Genérico para Params Complexos (VM, CPAP, BIPAP, CNAF)
    const updateParams = (
        index: number,
        type: 'vmParameters' | 'cpapParams' | 'bipapParams' | 'cnafParams',
        param: string,
        value: string
    ) => {
        const updated = [...selectedSupports];
        // Garantir que o objeto existe antes de espalhar
        const currentParams = updated[index][type] || {};
        // @ts-ignore
        updated[index][type] = { ...currentParams, [param]: value };
        onChange(updated);
    };

    const getAvailableSupports = () => {
        const allSupports = isArtificialAirway ? RESPIRATORY_SUPPORTS_ARTIFICIAL : RESPIRATORY_SUPPORTS_NATURAL;
        return allSupports.filter(
            support => !selectedSupports.some(selected => selected.support.id === support.id)
        );
    };

    const getVmParameterLabel = (param: string): string => {
        const labels: { [key: string]: string } = {
            fio2: 'FiO₂ (%)', peep: 'PEEP', pc: 'PC', vc: 'VC (ml)', ps: 'PS',
            fr_programmed: 'FR Prog.', fr_real: 'FR Real', vc_delivered: 'VC Real (ml)',
            ipap: 'IPAP', epap: 'EPAP', flow: 'Fluxo (L/min)', fr: 'FR (rpm)'
        };
        return labels[param] || param;
    };

    const availableSupports = getAvailableSupports();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <label className="block text-sm font-semibold text-slate-600">Suporte Respiratório</label>
                </div>
                {availableSupports.length > 0 && !showAddSupport && (
                    <button type="button" onClick={() => setShowAddSupport(true)} className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors">
                        <Plus className="w-3 h-3" /> <span>Adicionar</span>
                    </button>
                )}
            </div>

            {/* Dropdown de Seleção */}
            {showAddSupport && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecione o suporte</span>
                        <button onClick={() => setShowAddSupport(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableSupports.map((support) => (
                            <button
                                key={support.id}
                                type="button"
                                onClick={() => selectSupport(support)}
                                className="text-left px-3 py-2 bg-white border border-slate-200 rounded hover:border-blue-400 hover:shadow-sm transition-all text-sm text-slate-700"
                            >
                                {support.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {selectedSupports.length === 0 && !showAddSupport && (
                <div className="text-center py-6 text-gray-500 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors border-dashed" onClick={() => setShowAddSupport(true)}>
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm">Nenhum suporte selecionado</div>
                    <div className="text-xs text-gray-400">Clique para adicionar</div>
                </div>
            )}

            {/* Lista de Suportes Selecionados */}
            {selectedSupports.map((item, index) => (
                <div key={`${item.support.id}-${index}`} className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm relative group">
                    <button onClick={() => removeSupport(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>

                    <h3 className="font-bold text-blue-700 text-sm mb-3 flex items-center gap-2">
                        {item.support.name}
                    </h3>

                    <div className="grid gap-3">

                        {/* 1. VM PARAMS (Ventilação Mecânica) */}
                        {item.support.parameterType === 'vm_params' && item.support.vmParams && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {item.support.vmParams.map(p => {
                                    // Lógica para aviso visual de Volume Corrente (VC) por peso predito
                                    const vcRatio = vcRatios.find(r => r.support.support.id === item.support.id);
                                    const showVcWarning = p === 'vc_delivered' && vcRatio;

                                    return (
                                        <div key={p}>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs text-slate-500">{getVmParameterLabel(p)}</label>
                                                {showVcWarning && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${vcRatio.ratio < 6
                                                            ? 'text-green-600 bg-green-50 border-green-200'
                                                            : vcRatio.ratio <= 8
                                                                ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                                                : 'text-red-600 bg-red-50 border-red-200'
                                                        }`}>
                                                        {vcRatio.ratio.toFixed(1)} ml/kg
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border"
                                                value={item.vmParameters?.[p as keyof typeof item.vmParameters] || ''}
                                                onChange={(e) => updateParams(index, 'vmParameters', p, e.target.value)}
                                                placeholder={p === 'fio2' ? '21-100' : ''}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 2. CPAP (FiO2, EPAP, FR) */}
                        {item.support.parameterType === 'cpap' && (
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { key: 'fio2', label: 'FiO₂ (%)', place: '21-100' },
                                    { key: 'epap', label: 'EPAP', place: '5-15' },
                                    { key: 'fr', label: 'FR (rpm)', place: '12-30' }
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.place}
                                            value={item.cpapParams?.[field.key as keyof typeof item.cpapParams] || ''}
                                            onChange={(e) => updateParams(index, 'cpapParams', field.key, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3. BIPAP (FiO2, IPAP, EPAP, FR) */}
                        {item.support.parameterType === 'bipap' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { key: 'fio2', label: 'FiO₂ (%)', place: '21-100' },
                                    { key: 'ipap', label: 'IPAP', place: '8-20' },
                                    { key: 'epap', label: 'EPAP', place: '4-10' },
                                    { key: 'fr', label: 'FR (rpm)', place: '12-30' }
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.place}
                                            value={item.bipapParams?.[field.key as keyof typeof item.bipapParams] || ''}
                                            onChange={(e) => updateParams(index, 'bipapParams', field.key, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 4. CNAF (Fluxo, FiO2, FR) */}
                        {item.support.parameterType === 'cnaf' && (
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { key: 'flow', label: 'Fluxo (L/min)', place: '10-60' },
                                    { key: 'fio2', label: 'FiO₂ (%)', place: '21-100' },
                                    { key: 'fr', label: 'FR (rpm)', place: '12-30' }
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.place}
                                            value={item.cnafParams?.[field.key as keyof typeof item.cnafParams] || ''}
                                            onChange={(e) => updateParams(index, 'cnafParams', field.key, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 5. Suportes Simples (FiO2 + FR) */}
                        {item.support.parameterType === 'fio2' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">FiO₂ (%)</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                        value={item.value || ''}
                                        placeholder={item.support.placeholder}
                                        min={item.support.minValue}
                                        max={item.support.maxValue}
                                        onChange={(e) => updateValue(index, Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">FR (rpm)</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                        value={item.fr || ''}
                                        placeholder="12-20"
                                        onChange={(e) => updateFr(index, e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 6. Suportes Simples (Fluxo + FR) */}
                        {item.support.parameterType === 'flow' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Fluxo ({item.support.unit})</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                        value={item.value || ''}
                                        placeholder={item.support.placeholder}
                                        min={item.support.minValue}
                                        max={item.support.maxValue}
                                        step="0.5"
                                        onChange={(e) => updateValue(index, Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">FR (rpm)</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-slate-300 rounded px-2 py-1 border focus:ring-blue-500 focus:border-blue-500"
                                        value={item.fr || ''}
                                        placeholder="12-20"
                                        onChange={(e) => updateFr(index, e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            ))}
        </div>
    );
}