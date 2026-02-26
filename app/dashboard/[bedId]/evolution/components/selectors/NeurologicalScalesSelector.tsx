'use client';

import { useState } from 'react';
import { Brain, Plus, X, AlertCircle } from 'lucide-react';

interface NeurologicalScale {
    id: string;
    name: string;
    type: 'RASS' | 'GCS' | 'BPS' | 'CPOT';
    value: string;
}

interface NeurologicalScalesSelectorProps {
    value: string;
    onChange: (value: string) => void;
    isIntubated?: boolean;
}

const RASS_OPTIONS = [
    { value: '+4', label: '+4 (Combativo)', description: 'Combativo, violento' },
    { value: '+3', label: '+3 (Muito agitado)', description: 'Puxa tubos, agressivo' },
    { value: '+2', label: '+2 (Agitado)', description: 'Briga com ventilador' },
    { value: '+1', label: '+1 (Inquieto)', description: 'Ansioso, movimentos não agressivos' },
    { value: '0', label: '0 (Alerta e calmo)', description: 'Espontaneamente calmo' },
    { value: '-1', label: '-1 (Sonolento)', description: 'Desperta com voz (>10s)' },
    { value: '-2', label: '-2 (Sedação leve)', description: 'Desperta com voz (<10s)' },
    { value: '-3', label: '-3 (Sedação moderada)', description: 'Movimento/olhos à voz' },
    { value: '-4', label: '-4 (Sedação profunda)', description: 'Sem resposta à voz, mov. físico' },
    { value: '-5', label: '-5 (Não responsivo)', description: 'Sem resposta a estímulos' }
];

const GCS_OPTIONS_NORMAL = [
    { value: '15', label: 'GCS 15' }, { value: '14', label: 'GCS 14' }, { value: '13', label: 'GCS 13' },
    { value: '12', label: 'GCS 12' }, { value: '11', label: 'GCS 11' }, { value: '10', label: 'GCS 10' },
    { value: '9', label: 'GCS 9' }, { value: '8', label: 'GCS 8' }, { value: '7', label: 'GCS 7' },
    { value: '6', label: 'GCS 6' }, { value: '5', label: 'GCS 5' }, { value: '4', label: 'GCS 4' },
    { value: '3', label: 'GCS 3' }
];

const GCS_OPTIONS_INTUBATED = [
    { value: '10T', label: 'GCS 10T' }, { value: '9T', label: 'GCS 9T' }, { value: '8T', label: 'GCS 8T' },
    { value: '7T', label: 'GCS 7T' }, { value: '6T', label: 'GCS 6T' }, { value: '5T', label: 'GCS 5T' },
    { value: '4T', label: 'GCS 4T' }, { value: '3T', label: 'GCS 3T' }, { value: '2T', label: 'GCS 2T' }
];

const BPS_OPTIONS = [
    { value: '3', label: 'BPS 3 (Sem dor)' }, { value: '4', label: 'BPS 4' }, { value: '5', label: 'BPS 5' },
    { value: '6', label: 'BPS 6' }, { value: '7', label: 'BPS 7' }, { value: '8', label: 'BPS 8' },
    { value: '9', label: 'BPS 9' }, { value: '10', label: 'BPS 10' }, { value: '11', label: 'BPS 11' }, { value: '12', label: 'BPS 12 (Dor máx)' }
];

const CPOT_OPTIONS = [
    { value: '0', label: 'CPOT 0' }, { value: '1', label: 'CPOT 1' }, { value: '2', label: 'CPOT 2' },
    { value: '3', label: 'CPOT 3' }, { value: '4', label: 'CPOT 4' }, { value: '5', label: 'CPOT 5' },
    { value: '6', label: 'CPOT 6' }, { value: '7', label: 'CPOT 7' }, { value: '8', label: 'CPOT 8' }
];

const SCALE_DEFINITIONS = {
    RASS: { name: 'RASS', fullName: 'Escala de Agitação e Sedação', range: '+4 a -5', options: RASS_OPTIONS },
    GCS: { name: 'GCS', fullName: 'Escala de Coma de Glasgow', range: '3 a 15', options: [] },
    BPS: { name: 'BPS', fullName: 'Escala Comportamental de Dor', range: '3 a 12', options: BPS_OPTIONS },
    CPOT: { name: 'CPOT', fullName: 'Escala de Dor (UTI)', range: '0 a 8', options: CPOT_OPTIONS }
};

export default function NeurologicalScalesSelector({ value, onChange, isIntubated = false }: NeurologicalScalesSelectorProps) {
    const [showAddScale, setShowAddScale] = useState(false);
    const [editingScale, setEditingScale] = useState<string | null>(null);

    const parseScales = (text: string): NeurologicalScale[] => {
        if (!text) return [];
        const scales: NeurologicalScale[] = [];
        const parts = text.split(', ');
        for (const part of parts) {
            if (part.startsWith('RASS ')) scales.push({ id: 'RASS', name: 'RASS', type: 'RASS', value: part.replace('RASS ', '') });
            else if (part.startsWith('GCS ')) scales.push({ id: 'GCS', name: 'GCS', type: 'GCS', value: part.replace('GCS ', '') });
            else if (part.startsWith('BPS ')) scales.push({ id: 'BPS', name: 'BPS', type: 'BPS', value: part.replace('BPS ', '') });
            else if (part.startsWith('CPOT ')) scales.push({ id: 'CPOT', name: 'CPOT', type: 'CPOT', value: part.replace('CPOT ', '') });
        }
        return scales;
    };

    const formatScales = (scales: NeurologicalScale[]): string => scales.map(s => `${s.type} ${s.value}`).join(', ');
    const selectedScales = parseScales(value);

    const updateScaleValue = (type: string, newValue: string) => {
        const updated = selectedScales.map(s => s.type === type ? { ...s, value: newValue } : s);
        if (!selectedScales.some(s => s.type === type)) {
            updated.push({ id: type, name: type, type: type as any, value: newValue });
        }
        onChange(formatScales(updated));
        setEditingScale(null);
    };

    const removeScale = (type: string) => {
        const updated = selectedScales.filter(s => s.type !== type);
        onChange(formatScales(updated));
        setEditingScale(null);
    };

    const availableScales = ['RASS', 'GCS', 'BPS', 'CPOT'].filter(t => !selectedScales.some(s => s.type === t));
    const getGcsOptions = () => isIntubated ? GCS_OPTIONS_INTUBATED : GCS_OPTIONS_NORMAL;
    const getScaleOptions = (type: string) => type === 'GCS' ? getGcsOptions() : SCALE_DEFINITIONS[type as keyof typeof SCALE_DEFINITIONS].options;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-purple-100 p-1 rounded">
                        <Brain className="w-4 h-4 text-purple-600" />
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Escalas Neurológicas</label>
                </div>
                {availableScales.length > 0 && !showAddScale && (
                    <button type="button" onClick={() => setShowAddScale(true)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> <span>Adicionar Escala</span>
                    </button>
                )}
            </div>

            {showAddScale && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-sm font-medium text-purple-700">Selecione uma escala:</div>
                        <button onClick={() => setShowAddScale(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableScales.map(type => (
                            <button key={type} type="button" onClick={() => { setEditingScale(type); setShowAddScale(false); }} className="text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm">
                                <div className="font-bold text-sm text-gray-800">{SCALE_DEFINITIONS[type as keyof typeof SCALE_DEFINITIONS].name}</div>
                                <div className="text-xs text-gray-600 mt-1">{SCALE_DEFINITIONS[type as keyof typeof SCALE_DEFINITIONS].fullName}</div>
                                <div className="text-xs text-gray-600 mt-1 text-purple-600"><p>Escala:{SCALE_DEFINITIONS[type as keyof typeof SCALE_DEFINITIONS].range}</p></div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(editingScale || selectedScales.length > 0) && (
                <div className="space-y-3">
                    {selectedScales.map(scale => (
                        <div key={scale.type} className="bg-white border-2 border-purple-200 rounded-lg p-4 relative">
                            <button onClick={() => removeScale(scale.type)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                            <div className="font-bold text-sm text-purple-800 mb-2">{scale.type} - {scale.value}</div>
                            <div className="flex flex-wrap gap-2">
                                {getScaleOptions(scale.type).map(opt => (
                                    <button key={opt.value} onClick={() => updateScaleValue(scale.type, opt.value)} className={`px-2 py-1 text-xs border rounded ${scale.value === opt.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {editingScale && !selectedScales.some(s => s.type === editingScale) && (
                        <div className="bg-white border-2 border-purple-200 rounded-lg p-4 relative animate-fade-in">
                            <button onClick={() => setEditingScale(null)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                            <div className="font-bold text-sm text-gray-800 mb-2">Definir {editingScale}:</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {getScaleOptions(editingScale).map(opt => (
                                    <button key={opt.value} onClick={() => updateScaleValue(editingScale, opt.value)} className="p-2 text-xs border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 text-left">
                                        <span className="font-bold block">{opt.value}</span>
                                        <span className="text-[10px] text-gray-500">{opt.label.split('(')[1]?.replace(')', '')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedScales.length === 0 && !showAddScale && !editingScale && (
                <div className="text-center py-6 text-gray-500 bg-white border-2 border-gray-200 rounded-lg  hover:border-purple-500 cursor-pointer transition-colors border-dashed" onClick={() => {setShowAddScale(true);}}>
                    <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm">Nenhuma escala selecionada</div>
                    <p className='text-xs'>Clique para adicionar</p>
                </div>
            )}
        </div>
    );
}