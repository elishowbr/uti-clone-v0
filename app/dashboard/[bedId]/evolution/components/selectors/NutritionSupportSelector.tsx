'use client';

import { useState } from 'react';
import { Calculator, Calendar, AlertTriangle, Plus, X } from 'lucide-react';

export interface NutritionSupport {
    id: string;
    name: string;
    parameterType: 'oral' | 'enteral' | 'parenteral';
}

export interface OralParams {
    consistency: string;
}

export interface EnteralParams {
    route: string;
    observations: string;
}

export interface ParenteralParams {
    observations: string;
}

export interface SelectedNutritionSupport {
    support: NutritionSupport;
    oralParams?: OralParams;
    enteralParams?: EnteralParams;
    parenteralParams?: ParenteralParams;
}

interface NutritionSupportSelectorProps {
    selectedSupports: SelectedNutritionSupport[];
    onChange: (supports: SelectedNutritionSupport[]) => void;
    gastricResidue: string;
    onGastricResidueChange: (value: string) => void;
    prokineticsLaxatives: string;
    onProkineticsLaxativesChange: (value: string) => void;
    lastEvacuationDate: string;
    onLastEvacuationDateChange: (value: string) => void;
    evacuationAspect: string;
    onEvacuationAspectChange: (value: string) => void;
}

const NUTRITION_SUPPORTS: NutritionSupport[] = [
    { id: 'dieta_oral', name: 'Dieta oral', parameterType: 'oral' },
    { id: 'nutricao_enteral', name: 'Nutrição enteral', parameterType: 'enteral' },
    { id: 'nutricao_parenteral', name: 'Nutrição parenteral', parameterType: 'parenteral' }
];

export default function NutritionSupportSelector({
    selectedSupports = [],
    onChange,
    gastricResidue,
    onGastricResidueChange,
    prokineticsLaxatives,
    onProkineticsLaxativesChange,
    lastEvacuationDate,
    onLastEvacuationDateChange,
    evacuationAspect,
    onEvacuationAspectChange
}: NutritionSupportSelectorProps) {
    const [showSupportOptions, setShowSupportOptions] = useState(false);

    const calculateDaysSinceEvacuation = () => {
        if (!lastEvacuationDate) return { days: 0, message: '', alertLevel: 'none', isValidDate: true };
        const evacuationDate = new Date(lastEvacuationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        evacuationDate.setHours(0, 0, 0, 0);

        if (evacuationDate > today) return { days: 0, message: 'Data futura', alertLevel: 'danger', isValidDate: false };

        const diffTime = today.getTime() - evacuationDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 2) return { days: diffDays, message: 'Evacuações recentes', alertLevel: 'none', isValidDate: true };
        if (diffDays <= 3) return { days: diffDays, message: `${diffDays} dias sem evacuar`, alertLevel: 'warning', isValidDate: true };
        return { days: diffDays, message: `${diffDays} dias sem evacuar`, alertLevel: 'danger', isValidDate: true };
    };

    const evacuationInfo = calculateDaysSinceEvacuation();

    const handleSupportSelect = (support: NutritionSupport) => {
        if (selectedSupports.some(s => s.support.id === support.id)) {
            setShowSupportOptions(false);
            return;
        }

        const newSelected: SelectedNutritionSupport = {
            support,
            oralParams: support.parameterType === 'oral' ? { consistency: '' } : undefined,
            enteralParams: support.parameterType === 'enteral' ? { route: '', observations: '' } : undefined,
            parenteralParams: support.parameterType === 'parenteral' ? { observations: '' } : undefined,
        };
        onChange([...selectedSupports, newSelected]);
        setShowSupportOptions(false);
    };

    const updateParams = (supportId: string, type: 'oral' | 'enteral' | 'parenteral', params: any) => {
        const updated = selectedSupports.map(s => {
            if (s.support.id === supportId && s.support.parameterType === type) {
                if (type === 'oral') return { ...s, oralParams: { ...s.oralParams!, ...params } };
                if (type === 'enteral') return { ...s, enteralParams: { ...s.enteralParams!, ...params } };
                if (type === 'parenteral') return { ...s, parenteralParams: { ...s.parenteralParams!, ...params } };
            }
            return s;
        });
        onChange(updated);
    };

    const removeSupport = (supportId: string) => {
        onChange(selectedSupports.filter(s => s.support.id !== supportId));
    };

    const availableSupports = NUTRITION_SUPPORTS.filter(
        support => !selectedSupports.some(selected => selected.support.id === support.id)
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 p-1 rounded">
                        <Calculator className="w-4 h-4 text-gray-600" />
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Suporte Nutricional</label>
                </div>
                {availableSupports.length > 0 && !showSupportOptions && (
                    <button type="button" onClick={() => setShowSupportOptions(true)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> <span>Adicionar Suporte</span>
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showSupportOptions && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-sm font-medium text-gray-700">Selecione o tipo:</div>
                        <button onClick={() => setShowSupportOptions(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {availableSupports.map(support => (
                            <button key={support.id} type="button" onClick={() => handleSupportSelect(support)} className="text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <div className="font-medium text-sm text-gray-800">{support.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedSupports.length === 0 && !showSupportOptions && (
                <div className="text-center py-6 text-gray-500 bg-white border-2 border-gray-200 rounded-lg border-dashed hover:border-green-600 cursor-pointer" onClick={() => setShowSupportOptions(true)}>
                    <Calculator className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm">Nenhum suporte selecionado</div>
                </div>
            )}

            {/* Selected Supports */}
            {selectedSupports.map((item) => (
                <div key={item.support.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3 shadow-sm relative">
                    <button onClick={() => removeSupport(item.support.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="bg-gray-100 p-1 rounded"><Calculator className="w-3 h-3 text-gray-600" /></div>
                        <div className="font-medium text-sm text-gray-800">{item.support.name}</div>
                    </div>

                    {item.support.parameterType === 'oral' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Consistência</label>
                            <input type="text" value={item.oralParams?.consistency || ''} onChange={(e) => updateParams(item.support.id, 'oral', { consistency: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent" placeholder="Digite a consistência..." />
                            <div className="flex flex-wrap gap-1 mt-1">
                                {['Geral', 'Zero', 'Pastosa', 'Líquida'].map(s => (
                                    <button key={s} type="button" onClick={() => updateParams(item.support.id, 'oral', { consistency: s })} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.support.parameterType === 'enteral' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Via de Administração</label>
                                <input type="text" value={item.enteralParams?.route || ''} onChange={(e) => updateParams(item.support.id, 'enteral', { route: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent" placeholder="Ex: SNE" />
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['SNE', 'SNG', 'GTT'].map(s => (<button key={s} type="button" onClick={() => updateParams(item.support.id, 'enteral', { route: s })} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                                <input type="text" value={item.enteralParams?.observations || ''} onChange={(e) => updateParams(item.support.id, 'enteral', { observations: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent" placeholder="Ex: Fórmula padrão" />
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['A critério da nutrição', 'Fórmula padrão', 'Oligomérica', 'Imunomoduladora', 'Hipercalórica'].map(s => (<button key={s} type="button" onClick={() => updateParams(item.support.id, 'enteral', { observations: s })} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>))}
                                </div>
                            </div>
                        </div>
                    )}

                    {item.support.parameterType === 'parenteral' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                            <input type="text" value={item.parenteralParams?.observations || ''} onChange={(e) => updateParams(item.support.id, 'parenteral', { observations: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent" placeholder="Ex: NPT Padrão" />
                            <div className="flex flex-wrap gap-1 mt-1">
                                {['NPT padrão', 'NPT hipercalórica', 'A critério da nutrição', 'Com lipídios', 'Sem lipídios'].map(s => (<button key={s} type="button" onClick={() => updateParams(item.support.id, 'parenteral', { observations: s })} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Gastric & Prokinetics */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resíduo Gástrico</label>
                    <input type="text" value={gastricResidue} onChange={(e) => onGastricResidueChange(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Info sobre resíduo..." />
                    <div className="flex flex-wrap gap-1 mt-1">
                        {['Resíduo < 200 ml', 'Resíduo 200-500 ml', 'Resíduo > 500 ml', 'Sem resíduo significativo'].map(s => (
                            <button key={s} type="button" onClick={() => onGastricResidueChange(s)} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Procinéticos e Laxativos em uso</label>
                    <input type="text" value={prokineticsLaxatives} onChange={(e) => onProkineticsLaxativesChange(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Digite..." />
                    <div className="flex flex-wrap gap-1 mt-1">
                        {['Bromoprida', 'Metoclopramida', 'Domperidona', 'Bisacodil', 'Lactulose', 'Polietilenoglicol'].map(s => (
                            <button key={s} type="button" onClick={() => {
                                const val = prokineticsLaxatives ? `${prokineticsLaxatives}, ${s}` : s;
                                onProkineticsLaxativesChange(val);
                            }} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Evacuation */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> Última Evacuação</label>
                    <input type="date" value={lastEvacuationDate} onChange={(e) => onLastEvacuationDateChange(e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                    {lastEvacuationDate && (
                        <div className={`mt-2 p-2 rounded-lg text-sm flex items-center space-x-2 ${evacuationInfo.alertLevel === 'none' ? 'bg-green-50 text-green-700' :
                                evacuationInfo.alertLevel === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {evacuationInfo.alertLevel !== 'none' && <AlertTriangle className="w-4 h-4" />}
                            <span>{evacuationInfo.message}</span>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aspecto das Evacuações</label>
                    <input type="text" value={evacuationAspect} onChange={(e) => onEvacuationAspectChange(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Aspecto..." />
                    <div className="flex flex-wrap gap-1 mt-1">
                        {['Fisiológicas', 'Pastosas', 'Líquidas', 'Diarreicas', 'Melena', 'Hematoquezia'].map(s => (
                            <button key={s} type="button" onClick={() => onEvacuationAspectChange(s)} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{s}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}