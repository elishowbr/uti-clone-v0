'use client';

import { useState } from 'react';
import { Plus, X, Calculator } from 'lucide-react';

export interface DrugDefinition {
    id: string;
    name: string;
    concentration: number;
    unit: string;
    doseUnit: string;
    conversionFactor: number;
}

export interface SelectedDrug {
    drug: DrugDefinition;
    flow: number;
    dose: number;
    patientWeight: number;
    customConcentration?: number;
}

interface GenericDrugSelectorProps {
    label: string;
    availableDrugsList: DrugDefinition[];
    selectedDrugs: SelectedDrug[];
    onChange: (drugs: SelectedDrug[]) => void;
    patientWeight: number;
    colorTheme?: 'purple' | 'blue' | 'red' | 'emerald';
}

// MAPA DE CORES 
const colorMap = {
    purple: {
        bgLight: 'bg-purple-50',
        bgIcon: 'bg-purple-100',
        text: 'text-purple-600',
        textDark: 'text-purple-800',
        border: 'border-purple-200',
        hoverBorder: 'hover:border-purple-500', // Classe de hover explícita e mais forte
        btn: 'bg-purple-600 hover:bg-purple-700',
        focusRing: 'focus:ring-purple-500',     // Para os inputs
        focusBorder: 'focus:border-purple-500'  // Para os inputs
    },
    blue: {
        bgLight: 'bg-blue-50',
        bgIcon: 'bg-blue-100',
        text: 'text-blue-600',
        textDark: 'text-blue-800',
        border: 'border-blue-200',
        hoverBorder: 'hover:border-blue-500',
        btn: 'bg-blue-600 hover:bg-blue-700',
        focusRing: 'focus:ring-blue-500',
        focusBorder: 'focus:border-blue-500'
    },
    red: {
        bgLight: 'bg-red-50',
        bgIcon: 'bg-red-100',
        text: 'text-red-600',
        textDark: 'text-red-800',
        border: 'border-red-200',
        hoverBorder: 'hover:border-red-500',
        btn: 'bg-red-600 hover:bg-red-700',
        focusRing: 'focus:ring-red-500',
        focusBorder: 'focus:border-red-500'
    },
    emerald: {
        bgLight: 'bg-emerald-50',
        bgIcon: 'bg-emerald-100',
        text: 'text-emerald-600',
        textDark: 'text-emerald-800',
        border: 'border-emerald-200',
        hoverBorder: 'hover:border-emerald-500',
        btn: 'bg-emerald-600 hover:bg-emerald-700',
        focusRing: 'focus:ring-emerald-500',
        focusBorder: 'focus:border-emerald-500'
    },
};

export default function GenericDrugSelector({
    label,
    availableDrugsList,
    selectedDrugs = [],
    onChange,
    patientWeight,
    colorTheme = 'purple' // Mudei o default para purple para testar
}: GenericDrugSelectorProps) {
    const [showAddDrug, setShowAddDrug] = useState(false);
    const theme = colorMap[colorTheme];

    const calculateDose = (drug: DrugDefinition, flow: number, weight: number, customConcentration?: number): number => {
        if (flow <= 0 || weight <= 0) return 0;
        const concentration = customConcentration ?? drug.concentration;
        let dose = (flow * concentration) / weight;
        if (drug.conversionFactor !== 1) dose = dose / drug.conversionFactor;
        return Math.round(dose * 100) / 100;
    };

    const addDrug = (drugId: string) => {
        const drug = availableDrugsList.find(d => d.id === drugId);
        if (!drug) return;

        const newSelectedDrug: SelectedDrug = {
            drug,
            flow: 0,
            dose: 0,
            patientWeight
        };

        onChange([...selectedDrugs, newSelectedDrug]);
        setShowAddDrug(false);
    };

    const updateDrugFlow = (index: number, flow: number) => {
        const updated = [...selectedDrugs];
        updated[index].flow = flow;
        updated[index].dose = calculateDose(updated[index].drug, flow, updated[index].patientWeight, updated[index].customConcentration);
        onChange(updated);
    };

    const updateConcentration = (index: number, concentration: number) => {
        const updated = [...selectedDrugs];
        updated[index].customConcentration = concentration;
        updated[index].dose = calculateDose(updated[index].drug, updated[index].flow, updated[index].patientWeight, concentration);
        onChange(updated);
    };

    const removeDrug = (index: number) => {
        const updated = selectedDrugs.filter((_, i) => i !== index);
        onChange(updated);
    };

    const drugsToSelect = availableDrugsList.filter(
        drug => !selectedDrugs.some(selected => selected.drug.id === drug.id)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className={`${theme.bgIcon} p-1 rounded`}>
                        <Calculator className={`w-4 h-4 ${theme.text}`} />
                    </div>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                </div>
                {!showAddDrug && (
                    <button type="button" onClick={() => setShowAddDrug(!showAddDrug)} className={`flex items-center space-x-1 px-3 py-1.5 text-sm text-white rounded-lg transition-colors shadow-sm ${theme.btn}`}>
                        <Plus className="w-4 h-4" /> <span>Adicionar Droga</span>
                    </button>
                )}
            </div>

            {showAddDrug && (
                <div className={`${theme.bgLight} p-4 rounded-lg border ${theme.border} animate-fade-in`}>
                    <div className={`text-sm font-medium ${theme.textDark} mb-3`}>Selecione uma droga:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {drugsToSelect.map(drug => (
                            <button
                                key={drug.id}
                                type="button"
                                onClick={() => addDrug(drug.id)}
                                // CORREÇÃO: Usando hoverBorder diretamente do tema
                                className={`text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:${theme.bgLight} ${theme.hoverBorder} transition-all shadow-sm`}
                            >
                                <div className="font-medium text-sm text-gray-800">{drug.name}</div>
                                <div className="text-xs text-gray-500 mt-1">Conc. Padrão: {drug.concentration} {drug.unit}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedDrugs.length === 0 && !showAddDrug && (
                <div
                    // CORREÇÃO: Removido 'border-${theme.border}' e usado '${theme.hoverBorder}'
                    // Antes estava: hover:border-${theme.border} -> hover:border-border-purple-200 (Inválido)
                    // Agora é: ${theme.hoverBorder} -> hover:border-purple-500 (Válido)
                    className={`text-center py-6 text-gray-500 bg-white border-2 border-gray-200 rounded-lg ${theme.hoverBorder} cursor-pointer transition-colors border-dashed`}
                    onClick={() => setShowAddDrug(true)}
                >
                    <Calculator className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm">Nenhuma droga selecionada</div>
                    <p className='text-xs'>Clique para adicionar</p>
                </div>
            )}

            {selectedDrugs.map((selected, index) => (
                <div key={selected.drug.id} className={`bg-white border-2 ${theme.border} rounded-lg p-4 space-y-3 shadow-sm relative group`}>
                    <button onClick={() => removeDrug(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    <div className={`font-medium text-sm ${theme.textDark}`}>{selected.drug.name}</div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Concentração ({selected.drug.unit})</label>
                            {/* CORREÇÃO: Inputs agora usam a cor do tema no focus */}
                            <input
                                type="number"
                                value={selected.customConcentration ?? selected.drug.concentration}
                                onChange={(e) => updateConcentration(index, Number(e.target.value))}
                                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 ${theme.focusRing} focus:border-transparent outline-none transition-all`}
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Vazão (ml/h)</label>
                            <input
                                type="number"
                                value={selected.flow}
                                onChange={(e) => updateDrugFlow(index, Number(e.target.value))}
                                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 ${theme.focusRing} focus:border-transparent outline-none transition-all`}
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Dose Calculada</label>
                            <div className="px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded font-mono text-gray-700">
                                {selected.dose > 0 ? `${selected.dose} ${selected.drug.doseUnit}` : '---'}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}